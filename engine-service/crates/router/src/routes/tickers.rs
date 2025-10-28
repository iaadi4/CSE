use crate::types::app::AppState;
use actix_web::web::Data;

use db_processor::query::get_tickers_from_db;

use std::time::Instant;

pub async fn get_tickers(app_state: Data<AppState>) -> actix_web::HttpResponse {
    let starttime = Instant::now();

    println!("Get Tickers:");

    let pg_pool = app_state.postgres_db.get_pg_connection().unwrap();

    let tickers = get_tickers_from_db(&pg_pool).await.unwrap();

    println!("Time: {:?}", starttime.elapsed());

    actix_web::HttpResponse::Ok().json(tickers)
}
