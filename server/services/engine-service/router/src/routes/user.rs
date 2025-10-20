use actix_web::web::Data;
use serde_json::to_string;
use std::time::Instant;
use uuid::Uuid;

use crate::types::{
    app::AppState,
    routes::{CreateUserInput, UserRequests},
};

use redis::RedisQueue;

pub async fn create_user(app_state: Data<AppState>) -> actix_web::HttpResponse {
    let starttime = Instant::now();

    let user_id = Uuid::new_v4(); // ideally this would be fetched from cookies or JWT

    let pubsub_id = Some(Uuid::new_v4());
    let create_user_input = CreateUserInput {
        user_id: user_id.to_string(),
        pubsub_id,
    };

    let create_user_request = UserRequests::CreateUser(create_user_input);
    let create_user_data = to_string(&create_user_request).unwrap();
    println!("Create User: {}", create_user_data);

    let redis_connection = &app_state.redis_connection;
    if let Some(pubsub_id_value) = pubsub_id {
        let result = redis_connection
            .push_and_wait_for_subscriber(
                &RedisQueue::USERS.to_string(),
                create_user_data,
                &pubsub_id_value.to_string(),
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
                println!("Failed to create user - {}", e);
                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::InternalServerError().finish();
            }
        }
    }

    println!("Timeout: {:?}", starttime.elapsed());
    return actix_web::HttpResponse::InternalServerError().finish();
}