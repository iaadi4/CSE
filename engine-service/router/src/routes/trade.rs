use actix_web::web::Data;

use std::time::Instant;

use crate::types::{app::AppState, routes::GetTradesInput};

pub async fn get_trades(
    query: actix_web::web::Query<GetTradesInput>,
    _app_state: Data<AppState>,
) -> actix_web::HttpResponse {
    let starttime = Instant::now();
    let market_data = query.into_inner();

    println!("Get Trades: {}", market_data.symbol);

    // TODO: Implement actual database query
    let trades: Vec<serde_json::Value> = vec![];

    println!("Time: {:?}", starttime.elapsed());

    actix_web::HttpResponse::Ok().json(trades)
}
