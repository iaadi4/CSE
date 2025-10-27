use actix_web::web::Data;
use sqlx_postgres::query::get_klines_timeseries_data;

use std::time::Instant;

use crate::types::{app::AppState, routes::GetKlinesInput};

pub async fn get_klines(
    query: actix_web::web::Query<GetKlinesInput>,
    app_state: Data<AppState>,
) -> actix_web::HttpResponse {
    let starttime = Instant::now();
    let mut klines_input = query.into_inner();

    klines_input.interval = match klines_input.interval.as_str() {
        "1y" | "1Y" => "year".to_string(),
        "1M" => "month".to_string(),  // Capital M for month
        "1w" | "1W" => "week".to_string(),
        "1d" | "1D" => "day".to_string(),
        "4h" | "4H" => "hour".to_string(),  // 4 hour intervals -> use hour grouping
        "1h" | "1H" => "hour".to_string(),
        "15m" | "15M" => "minute".to_string(),  // 15 min intervals -> use minute grouping
        "5m" | "5M" => "minute".to_string(),    // 5 min intervals -> use minute grouping
        "1m" | "1min" | "1MIN" => "minute".to_string(),
        _ => "hour".to_string(),  // Default to hour instead of week
    };

    println!("Get Klines: {}", klines_input.symbol);

    let pg_pool = app_state.postgres_db.get_pg_connection().unwrap();

    let start_time = if klines_input.start_time.is_empty() {
        None
    } else {
        klines_input.start_time.parse::<i64>().ok()
    };
    
    let klines = get_klines_timeseries_data(
        &pg_pool,
        klines_input.symbol,
        klines_input.interval,
        start_time,
    )
    .await
    .unwrap();

    println!("Timeout: {:?}", starttime.elapsed());

    actix_web::HttpResponse::Ok().json(klines)
}