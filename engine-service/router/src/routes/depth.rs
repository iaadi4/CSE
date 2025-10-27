use actix_web::web::Data;

use serde_json::to_string;
use std::time::Instant;
use uuid::Uuid;

use crate::types::{
    app::AppState,
    routes::{GetDepthInput, OrderRequests},
};

use redis::RedisQueue;

pub async fn get_depth(
    query: actix_web::web::Query<GetDepthInput>,
    app_state: Data<AppState>,
) -> actix_web::HttpResponse {
    let starttime = Instant::now();
    let mut market_data = query.into_inner();
    let pubsub_id = Some(Uuid::new_v4());
    market_data.pubsub_id = pubsub_id;

    let get_depth_request = OrderRequests::GetDepth(market_data.clone());
    let get_depth_data = to_string(&get_depth_request).unwrap();
    println!("Get Depth: {}", get_depth_data);

    let redis_connection = &app_state.redis_connection;
    if let Some(pubsub_id_value) = pubsub_id {
        // Try to get depth from Redis with a timeout
        let result = tokio::time::timeout(
            std::time::Duration::from_millis(100),
            redis_connection.push_and_wait_for_subscriber(
                &RedisQueue::ORDERS.to_string(),
                get_depth_data,
                &pubsub_id_value.to_string(),
            )
        )
        .await;

        match result {
            Ok(Ok(published_data)) => {
                let published_data_json: serde_json::Value =
                    serde_json::from_str(&published_data).unwrap();

                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::Ok().json(published_data_json);
            }
            Ok(Err(e)) => {
                println!("Failed to get depth from redis - {}", e);
            }
            Err(_) => {
                println!("Timeout waiting for depth response");
            }
        }
    }

    // Return mock/empty depth data if core-engine is not available
    println!("Returning empty depth data. Time: {:?}", starttime.elapsed());
    let empty_depth = serde_json::json!({
        "bids": [],
        "asks": [],
        "lastUpdateId": "0"
    });
    actix_web::HttpResponse::Ok().json(empty_depth)
}