use actix_web::web::Data;
use db_processor::query::get_trades_from_db;

use std::time::Instant;

use crate::types::{app::AppState, routes::GetTradesInput};

pub async fn get_trades(
    query: actix_web::web::Query<GetTradesInput>,
    app_state: Data<AppState>,
) -> actix_web::HttpResponse {
    let starttime = Instant::now();
    let market_data = query.into_inner();

    println!("Get Trades: {}", market_data.symbol);

    let pg_pool = app_state.postgres_db.get_pg_connection().unwrap();

    let trades = get_trades_from_db(&pg_pool, market_data.symbol)
        .await
        .unwrap();

    println!("Timeout: {:?}", starttime.elapsed());

    actix_web::HttpResponse::Ok().json(trades)
}
