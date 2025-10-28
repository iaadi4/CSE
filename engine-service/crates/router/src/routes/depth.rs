use actix_web::web::Data;

use serde_json::to_string;
use std::time::Instant;
use uuid::Uuid;

use crate::types::{
    app::AppState,
    routes::{GetDepthInput, OrderRequests},
};

use redis::RedisQueues;

pub async fn get_depth(
    query: actix_web::web::Query<GetDepthInput>,
    app_state: Data<AppState>,
) -> actix_web::HttpResponse {
    let starttime = Instant::now();
    let mut market_data = query.into_inner();
    let pubsub_id = Some(Uuid::new_v4());
    market_data.pubsub_id = pubsub_id;

    let get_depth_request = OrderRequests::GetDepth(market_data);
    let get_depth_data = to_string(&get_depth_request).unwrap();
    println!("Get Depth: {}", get_depth_data);

    let redis_connection = &app_state.redis_connection;
    if let Some(pubsub_id_value) = pubsub_id {
        let result = redis_connection
            .push_and_wait_for_subscriber(
                RedisQueues::ORDERS.to_string(),
                get_depth_data,
                pubsub_id_value,
            )
            .await;

        match result {
            Ok(published_data) => {
                let published_data_json: serde_json::Value =
                    serde_json::from_str(&published_data).unwrap();

                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::Ok().json(published_data_json);
            }
            Err(e) => {
                println!("Failed to get depth from redis - {}", e);
                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::InternalServerError().finish();
            }
        }
    }

    println!("Timeout: {:?}", starttime.elapsed());
    actix_web::HttpResponse::Ok().finish()
}
