use fred::prelude::*;
use serde_json::json;
use sqlx::{Pool, Postgres};
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::time::{sleep, Duration};
use rand::{Rng, SeedableRng};

#[derive(Debug, Clone)]
struct Market {
    symbol: String,
    base_price: f64,
    volatility: f64,
    volume_min: f64,
    volume_max: f64,
}

#[derive(Debug, Clone)]
struct OrderbookState {
    bids: Vec<(f64, f64)>, // (price, quantity)
    asks: Vec<(f64, f64)>,
}

async fn get_redis_client() -> Result<Client, fred::error::Error> {
    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".to_string());
    let config = Config::from_url(&redis_url)?;
    let client = Builder::from_config(config).build()?;
    client.init().await?;
    Ok(client)
}

async fn get_postgres_connection() -> Result<Pool<Postgres>, sqlx::Error> {
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://exchange_user:exchange_password@localhost:5432/exchange".to_string());
    
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;
    
    Ok(pool)
}

fn generate_price_movement(base_price: f64, volatility: f64) -> f64 {
    let mut rng = rand::rngs::StdRng::from_entropy();
    let change_percent = rng.gen_range(-volatility..volatility);
    base_price * (1.0 + change_percent / 100.0)
}

fn generate_orderbook(current_price: f64, spread_percent: f64) -> OrderbookState {
    let mut rng = rand::rngs::StdRng::from_entropy();
    let spread = current_price * (spread_percent / 100.0);
    
    let mut bids = Vec::new();
    let mut asks = Vec::new();
    
    // Generate 10 bid levels
    for i in 0..10 {
        let price = current_price - spread / 2.0 - (i as f64 * spread * 0.1);
        let quantity = rng.gen_range(0.1..10.0);
        bids.push((price, quantity));
    }
    
    // Generate 10 ask levels
    for i in 0..10 {
        let price = current_price + spread / 2.0 + (i as f64 * spread * 0.1);
        let quantity = rng.gen_range(0.1..10.0);
        asks.push((price, quantity));
    }
    
    OrderbookState { bids, asks }
}

async fn publish_trade(
    client: &Client,
    symbol: &str,
    price: f64,
    quantity: f64,
    is_buyer_maker: bool,
) -> Result<(), fred::error::Error> {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64;
    
    let trade_data = json!({
        "e": "trade",  // event type
        "s": symbol,   // symbol
        "p": format!("{:.8}", price),  // price
        "q": format!("{:.8}", quantity),  // quantity
        "t": timestamp,  // trade id
        "T": timestamp,  // timestamp
        "m": is_buyer_maker,  // is buyer maker
    });
    
    let message = json!({
        "stream": format!("trade.{}", symbol),
        "data": trade_data
    });
    
    // Publish to Redis channel for WebSocket streaming
    client.publish::<(), _, _>(format!("trade.{}", symbol), message.to_string()).await?;
    
    Ok(())
}

async fn publish_ticker(
    client: &Client,
    symbol: &str,
    last_price: f64,
    high: f64,
    low: f64,
    volume: f64,
    price_change: f64,
    price_change_percent: f64,
) -> Result<(), fred::error::Error> {
    let ticker_data = json!({
        "e": "ticker",  // event type
        "s": symbol,    // symbol
        "c": format!("{:.8}", last_price),  // close/last price
        "h": format!("{:.8}", high),        // high price
        "l": format!("{:.8}", low),         // low price
        "v": format!("{:.2}", volume),      // volume
        "V": format!("{:.2}", volume * last_price),  // quote volume
        "p": format!("{:.8}", price_change),         // price change
        "P": format!("{:.2}", price_change_percent), // price change percent
    });
    
    let message = json!({
        "stream": format!("ticker.{}", symbol),
        "data": ticker_data
    });
    
    // Publish to Redis channel for WebSocket streaming
    client.publish::<(), _, _>(format!("ticker.{}", symbol), message.to_string()).await?;
    
    Ok(())
}

async fn publish_depth(
    client: &Client,
    symbol: &str,
    orderbook: &OrderbookState,
) -> Result<(), fred::error::Error> {
    let depth_data = json!({
        "e": "depth",  // event type
        "s": symbol,   // symbol
        "b": orderbook.bids.iter().map(|(p, q)| vec![
            format!("{:.8}", p),
            format!("{:.8}", q)
        ]).collect::<Vec<_>>(),
        "a": orderbook.asks.iter().map(|(p, q)| vec![
            format!("{:.8}", p),
            format!("{:.8}", q)
        ]).collect::<Vec<_>>(),
        "u": SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis(),
        "U": SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis(),
    });
    
    let message = json!({
        "stream": format!("depth.{}", symbol),
        "data": depth_data
    });
    
    // Publish to Redis channel for WebSocket streaming
    client.publish::<(), _, _>(format!("depth.{}", symbol), message.to_string()).await?;
    
    Ok(())
}

async fn insert_trade_to_db(
    pool: &Pool<Postgres>,
    symbol: &str,
    price: f64,
    quantity: f64,
    timestamp: i64,
    is_buyer_maker: bool,
) -> Result<(), sqlx::Error> {
    let trade_id = timestamp; // Use timestamp as trade_id for simplicity
    let user_id = if is_buyer_maker { "buyer_sim" } else { "seller_sim" };
    let other_user_id = if is_buyer_maker { "seller_sim" } else { "buyer_sim" };
    let order_id = format!("order_{}", timestamp);
    
    sqlx::query(
        r#"
        INSERT INTO trades (trade_id, market, price, quantity, user_id, other_user_id, order_id, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (trade_id) DO NOTHING
        "#
    )
    .bind(trade_id)
    .bind(symbol)
    .bind(price)
    .bind(quantity)
    .bind(user_id)
    .bind(other_user_id)
    .bind(order_id)
    .bind(timestamp)
    .execute(pool)
    .await?;
    
    Ok(())
}

async fn simulate_market(
    redis_client: Client,
    pg_pool: Pool<Postgres>,
    market: Market,
) {
    let mut current_price = market.base_price;
    
    // Track 24h stats
    let mut high_24h = current_price;
    let mut low_24h = current_price;
    let mut volume_24h = 0.0;
    let start_price = current_price;
    
    println!("🚀 Starting simulation for {} at ${:.2}", market.symbol, current_price);
    
    loop {
        // Create RNG for each iteration to avoid Send issues
        let mut rng = rand::rngs::StdRng::from_entropy();
        
        // Generate new price with some volatility
        current_price = generate_price_movement(current_price, market.volatility);
        
        // Update 24h stats
        high_24h = high_24h.max(current_price);
        low_24h = low_24h.min(current_price);
        
        // Generate random trade
        let quantity = rng.gen_range(market.volume_min..market.volume_max);
        let is_buyer_maker = rng.gen_bool(0.5);
        
        volume_24h += quantity;
        
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64;
        
        // Insert trade to database
        if let Err(e) = insert_trade_to_db(&pg_pool, &market.symbol, current_price, quantity, timestamp, is_buyer_maker).await {
            eprintln!("❌ Failed to insert trade to DB for {}: {}", market.symbol, e);
        }
        
        // Publish trade
        if let Err(e) = publish_trade(&redis_client, &market.symbol, current_price, quantity, is_buyer_maker).await {
            eprintln!("❌ Failed to publish trade for {}: {}", market.symbol, e);
        } else {
            println!("💹 {} trade: ${:.2} x {:.4}", market.symbol, current_price, quantity);
        }
        
        // Generate and publish orderbook
        let orderbook = generate_orderbook(current_price, 0.5);
        if let Err(e) = publish_depth(&redis_client, &market.symbol, &orderbook).await {
            eprintln!("❌ Failed to publish depth for {}: {}", market.symbol, e);
        }
        
        // Publish ticker update
        let price_change = current_price - start_price;
        let price_change_percent = (price_change / start_price) * 100.0;
        
        if let Err(e) = publish_ticker(
            &redis_client,
            &market.symbol,
            current_price,
            high_24h,
            low_24h,
            volume_24h,
            price_change,
            price_change_percent,
        ).await {
            eprintln!("❌ Failed to publish ticker for {}: {}", market.symbol, e);
        }
        
        // Random delay between trades (1-5 seconds)
        let delay_ms = rng.gen_range(1000..5000);
        sleep(Duration::from_millis(delay_ms)).await;
    }
}

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    
    println!("╔════════════════════════════════════════╗");
    println!("║   Market Simulator Starting...         ║");
    println!("╚════════════════════════════════════════╝");
    println!();
    
    // Get PostgreSQL connection
    let pg_pool = match get_postgres_connection().await {
        Ok(pool) => {
            println!("✅ Connected to PostgreSQL");
            pool
        },
        Err(e) => {
            eprintln!("❌ Failed to connect to PostgreSQL: {}", e);
            return;
        }
    };
    
    // Define markets to simulate
    let markets = vec![
        Market {
            symbol: "SOL_USDC".to_string(),
            base_price: 145.0,
            volatility: 2.0,
            volume_min: 0.5,
            volume_max: 10.0,
        },
        Market {
            symbol: "BTC_USDC".to_string(),
            base_price: 69000.0,
            volatility: 1.5,
            volume_min: 0.01,
            volume_max: 0.5,
        },
        Market {
            symbol: "ETH_USDC".to_string(),
            base_price: 2580.0,
            volatility: 1.8,
            volume_min: 0.1,
            volume_max: 5.0,
        },
        Market {
            symbol: "AVAX_USDC".to_string(),
            base_price: 30.5,
            volatility: 3.0,
            volume_min: 1.0,
            volume_max: 20.0,
        },
        Market {
            symbol: "MATIC_USDC".to_string(),
            base_price: 0.95,
            volatility: 2.5,
            volume_min: 10.0,
            volume_max: 500.0,
        },
    ];
    
    println!("📊 Simulating {} markets:", markets.len());
    for market in &markets {
        println!("   • {} @ ${:.2}", market.symbol, market.base_price);
    }
    println!();
    
    // Get a single Redis client (will be cloned for each task)
    let redis_client = match get_redis_client().await {
        Ok(c) => {
            println!("✅ Redis connected");
            c
        },
        Err(e) => {
            eprintln!("❌ Failed to connect to Redis: {}", e);
            return;
        }
    };
    
    // Spawn a task for each market
    let mut handles = vec![];
    
    for market in markets {
        let client = redis_client.clone();
        let pool = pg_pool.clone();
        
        let handle = tokio::spawn(async move {
            simulate_market(client, pool, market).await;
        });
        
        handles.push(handle);
    }
    
    println!();
    println!("🔥 Market simulator is running! Press Ctrl+C to stop.");
    println!();
    
    // Wait for all tasks
    for handle in handles {
        let _ = handle.await;
    }
}
