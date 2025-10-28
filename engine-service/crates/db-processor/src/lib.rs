pub mod query;
pub mod types;

use fred::prelude::RedisValue;
use query::insert_trade;
use serde_json::from_str;
use sqlx::{Pool, Postgres};
use types::DatabaseRequests;

pub async fn handle_db_updates(data: Vec<RedisValue>, pg_pool: &Pool<Postgres>) {
    let data_to_process = &data[0];

    // Convert the RedisValue to a string
    let db_data = match data_to_process {
        RedisValue::String(s) => s.to_string(),
        // BYTES TYPE - NOT NEEDED FOR NOW - check if this can make it faster
        RedisValue::Bytes(b) => String::from_utf8(b.to_vec()).unwrap_or_else(|_| "".to_string()),
        _ => {
            println!("Unexpected Redis value type");
            return;
        }
    };

    // Now you can deserialize it using serde_json
    match from_str::<DatabaseRequests>(&db_data) {
        Ok(db_data) => match db_data {
            DatabaseRequests::InsertTrade(db_data) => {
                println!("Received Trade {:?}", db_data);
                let _ = insert_trade(pg_pool, db_data).await;
            }
        },
        Err(err) => {
            println!("Failed to deserialize db request: {:?}", err);
        }
    }
}
