use actix_web::web::Data;
use std::time::Instant;
use sqlx_postgres::query::get_trades_from_db;

use crate::types::{app::AppState, routes::GetTradesInput};

pub async fn get_trades(
    query: actix_web::web::Query<GetTradesInput>,
    app_state: Data<AppState>,
) -> actix_web::HttpResponse {
    let starttime = Instant::now();
    let market_data = query.into_inner();

    println!("Get Trades: {}", market_data.symbol);

    let pg_pool = match app_state.postgres_db.get_pg_connection() {
        Ok(pool) => pool,
        Err(e) => {
            println!("Failed to get database connection: {}", e);
            return actix_web::HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database connection failed"
            }));
        }
    };

    let trades = match get_trades_from_db(&pg_pool, market_data.symbol).await {
        Ok(trades) => trades,
        Err(e) => {
            println!("Failed to fetch trades: {}", e);
            println!("Time: {:?}", starttime.elapsed());
            return actix_web::HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch trades"
            }));
        }
    };

    println!("Time: {:?}", starttime.elapsed());

    actix_web::HttpResponse::Ok().json(trades)
}
