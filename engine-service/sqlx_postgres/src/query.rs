use sqlx::{Pool, Postgres, Row};
use sqlx::types::chrono;

#[derive(serde::Serialize)]
pub struct KlineData {
    pub open: String,
    pub high: String,
    pub low: String,
    pub close: String,
    pub volume: String,
    #[serde(rename = "quoteVolume")]
    pub quote_volume: String,
    pub start: String,
    pub end: String,
    pub trades: String,
}

#[derive(serde::Serialize)]
pub struct TickerData {
    pub symbol: String,
    #[serde(rename = "firstPrice")]
    pub first_price: String,
    pub high: String,
    #[serde(rename = "lastPrice")]
    pub last_price: String,
    pub low: String,
    #[serde(rename = "priceChange")]
    pub price_change: String,
    #[serde(rename = "priceChangePercent")]
    pub price_change_percent: String,
    #[serde(rename = "quoteVolume")]
    pub quote_volume: String,
    pub trades: String,
    pub volume: String,
}

pub async fn get_klines_timeseries_data(
    pool: &Pool<Postgres>,
    symbol: String,
    interval: String,
    start_time: Option<i64>,
) -> Result<Vec<KlineData>, sqlx::Error> {
    // Calculate start time if not provided (default to 7 days ago)
    let start_time = start_time.unwrap_or_else(|| {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;
        now - (7 * 24 * 60 * 60 * 1000) // 7 days in milliseconds
    });
    
    // Query to get OHLC data grouped by time interval
    // Using window functions to get first/last prices in each bucket
    let query = format!(r#"
        SELECT 
            EXTRACT(EPOCH FROM time_bucket)::BIGINT * 1000 as timestamp_ms,
            CAST(first_price AS DOUBLE PRECISION) as open,
            CAST(max_price AS DOUBLE PRECISION) as high,
            CAST(min_price AS DOUBLE PRECISION) as low,
            CAST(last_price AS DOUBLE PRECISION) as close,
            CAST(total_volume AS DOUBLE PRECISION) as volume,
            CAST(total_volume * last_price AS DOUBLE PRECISION) as quote_volume,
            trade_count
        FROM (
            SELECT 
                DATE_TRUNC('{}', TO_TIMESTAMP(timestamp / 1000)) as time_bucket,
                (ARRAY_AGG(price ORDER BY timestamp ASC))[1] as first_price,
                MAX(price) as max_price,
                MIN(price) as min_price,
                (ARRAY_AGG(price ORDER BY timestamp DESC))[1] as last_price,
                SUM(quantity) as total_volume,
                COUNT(*) as trade_count
            FROM trades 
            WHERE market = $1 AND timestamp >= $2
            GROUP BY DATE_TRUNC('{}', TO_TIMESTAMP(timestamp / 1000))
        ) as aggregated
        ORDER BY time_bucket ASC
        LIMIT 1000
    "#, interval, interval);
    
    let rows = sqlx::query(&query)
        .bind(&symbol)
        .bind(start_time)
        .fetch_all(pool)
        .await?;
    
    let mut klines = Vec::new();
    for row in rows {
        let timestamp_ms: i64 = row.try_get("timestamp_ms").unwrap_or(0);
        let open: f64 = row.try_get("open").unwrap_or(0.0);
        let high: f64 = row.try_get("high").unwrap_or(0.0);
        let low: f64 = row.try_get("low").unwrap_or(0.0);
        let close: f64 = row.try_get("close").unwrap_or(0.0);
        let volume: f64 = row.try_get("volume").unwrap_or(0.0);
        let quote_volume: f64 = row.try_get("quote_volume").unwrap_or(0.0);
        let trade_count: i64 = row.try_get("trade_count").unwrap_or(0);
        
        if timestamp_ms > 0 {
            klines.push(KlineData {
                open: format!("{:.8}", open),
                high: format!("{:.8}", high),
                low: format!("{:.8}", low),
                close: format!("{:.8}", close),
                volume: format!("{:.8}", volume),
                quote_volume: format!("{:.8}", quote_volume),
                start: timestamp_ms.to_string(),
                end: timestamp_ms.to_string(),
                trades: trade_count.to_string(),
            });
        }
    }
    
    Ok(klines)
}

pub async fn get_tickers_from_db(pool: &Pool<Postgres>) -> Result<Vec<TickerData>, sqlx::Error> {
    let query = r#"
        WITH latest_trades AS (
            SELECT DISTINCT ON (market)
                market,
                CAST(price AS DOUBLE PRECISION) as last_price
            FROM trades
            WHERE timestamp >= EXTRACT(EPOCH FROM NOW() - INTERVAL '24 hours') * 1000
            ORDER BY market, timestamp DESC
        ),
        earliest_trades AS (
            SELECT DISTINCT ON (market)
                market,
                CAST(price AS DOUBLE PRECISION) as first_price
            FROM trades
            WHERE timestamp >= EXTRACT(EPOCH FROM NOW() - INTERVAL '24 hours') * 1000
            ORDER BY market, timestamp ASC
        ),
        stats AS (
            SELECT 
                market,
                CAST(MAX(price) AS DOUBLE PRECISION) as high,
                CAST(MIN(price) AS DOUBLE PRECISION) as low,
                CAST(SUM(quantity) AS DOUBLE PRECISION) as volume,
                COUNT(*) as trade_count
            FROM trades 
            WHERE timestamp >= EXTRACT(EPOCH FROM NOW() - INTERVAL '24 hours') * 1000
            GROUP BY market
        )
        SELECT 
            stats.market as symbol,
            COALESCE(earliest_trades.first_price, 0.0) as first_price,
            stats.high,
            COALESCE(latest_trades.last_price, 0.0) as last_price,
            stats.low,
            stats.volume,
            stats.trade_count
        FROM stats
        LEFT JOIN latest_trades ON stats.market = latest_trades.market
        LEFT JOIN earliest_trades ON stats.market = earliest_trades.market
    "#;
    
    let rows = sqlx::query(query)
        .fetch_all(pool)
        .await?;
    
    let mut tickers = Vec::new();
    for row in rows {
        let symbol: String = row.try_get("symbol")?;
        let first_price: Option<f64> = row.try_get("first_price").ok();
        let high: f64 = row.try_get("high")?;
        let last_price: Option<f64> = row.try_get("last_price").ok();
        let low: f64 = row.try_get("low")?;
        let volume: f64 = row.try_get("volume")?;
        let trade_count: i64 = row.try_get("trade_count")?;
        
        let first_price = first_price.unwrap_or(0.0);
        let last_price = last_price.unwrap_or(0.0);
        
        // Calculate price change
        let price_change = if first_price > 0.0 {
            last_price - first_price
        } else {
            0.0
        };
        
        // Calculate price change percent
        let price_change_percent = if first_price > 0.0 {
            (price_change / first_price) * 100.0
        } else {
            0.0
        };
        
        tickers.push(TickerData {
            symbol,
            first_price: format!("{:.8}", first_price),
            high: format!("{:.8}", high),
            last_price: format!("{:.8}", last_price),
            low: format!("{:.8}", low),
            price_change: format!("{:.8}", price_change),
            price_change_percent: format!("{:.2}", price_change_percent),
            quote_volume: format!("{:.8}", volume * last_price),
            trades: trade_count.to_string(),
            volume: format!("{:.8}", volume),
        });
    }
    
    Ok(tickers)
}

#[derive(serde::Serialize)]
pub struct TradeData {
    pub id: i64,
    pub price: String,
    pub quantity: String,
    #[serde(rename = "quoteQuantity")]
    pub quote_quantity: String,
    pub timestamp: i64,
    #[serde(rename = "isBuyerMaker")]
    pub is_buyer_maker: bool,
}

pub async fn get_trades_from_db(
    pool: &Pool<Postgres>,
    symbol: String,
) -> Result<Vec<TradeData>, sqlx::Error> {
    let query = r#"
        SELECT 
            trade_id as id,
            CAST(price AS DOUBLE PRECISION) as price,
            CAST(quantity AS DOUBLE PRECISION) as quantity,
            timestamp,
            CASE 
                WHEN user_id < other_user_id THEN true 
                ELSE false 
            END as is_buyer_maker
        FROM trades 
        WHERE market = $1
        ORDER BY timestamp DESC
        LIMIT 100
    "#;
    
    let rows = sqlx::query(query)
        .bind(&symbol)
        .fetch_all(pool)
        .await?;
    
    let mut trades = Vec::new();
    for row in rows {
        let id: i64 = row.try_get("id").unwrap_or(0);
        let price: f64 = row.try_get("price").unwrap_or(0.0);
        let quantity: f64 = row.try_get("quantity").unwrap_or(0.0);
        let timestamp: i64 = row.try_get("timestamp").unwrap_or(0);
        let is_buyer_maker: bool = row.try_get("is_buyer_maker").unwrap_or(false);

        trades.push(TradeData {
            id,
            price: format!("{:.8}", price),
            quantity: format!("{:.8}", quantity),
            quote_quantity: format!("{:.8}", price * quantity),
            timestamp,
            is_buyer_maker,
        });
    }
    
    Ok(trades)
}