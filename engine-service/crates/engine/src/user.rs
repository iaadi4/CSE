use crate::{types::engine::UserRequests, Engine};
use fred::prelude::RedisValue;
use redis::RedisManager;
use serde_json::from_str;

pub async fn handle_user(
    data: Vec<RedisValue>,
    redis_connection: &RedisManager,
    engine: &mut Engine,
) {
    let user_to_process = &data[0];

    // Convert the RedisValue to a string
    let user_data = match user_to_process {
        RedisValue::String(s) => s.to_string(),
        _ => {
            println!("Unexpected Redis value type");
            return;
        }
    };

    // Now you can deserialize it using serde_json
    match from_str::<UserRequests>(&user_data) {
        Ok(user) => match user {
            UserRequests::CreateUser(user) => {
                println!("Create User: {:?}", user);
                let pubsub_id = user.pubsub_id.unwrap().to_string();
                let pubsub_id_ref = pubsub_id.as_str();

                engine.init_user_balance(user.user_id.as_str());

                let create_user_json = serde_json::json!({
                    "status": "Created User",
                    "user_id": user.user_id,
                });

                let create_user_string = serde_json::to_string(&create_user_json).unwrap();

                let _ = redis_connection
                    .publish(pubsub_id_ref, String::from(create_user_string))
                    .await;

                println!("Successfully created user!")
            }
        },
        Err(err) => {
            println!("Failed to deserialize user request: {:?}", err);
        }
    }
}
