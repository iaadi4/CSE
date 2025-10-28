pub mod engine;
pub mod order;
pub mod types;
pub mod user;

use engine::engine::Engine;
use order::handle_order;
use redis::{RedisManager, RedisQueues};
use sqlx_postgres::PostgresDb;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::task;
use user::handle_user;

#[tokio::main]
async fn main() {
    let redis_connection = Arc::new(RedisManager::new().await.unwrap());
    println!("Redis connected!");

    let postgres = PostgresDb::new().await.unwrap();
    let pg_pool = postgres.get_pg_connection().unwrap();
    println!("Postgres connection pool ready!");

    // Use Arc and Mutex to safely share engine across tasks
    let engine = Arc::new(Mutex::new(Engine::new()));
    engine.lock().await.init_engine(&pg_pool).await;
    engine.lock().await.init_user_balance("test_user");

    // Spawn a task to handle orders concurrently
    let redis_connection_orders = Arc::clone(&redis_connection); // Arc clone to share the same connection
    let engine_orders = Arc::clone(&engine);
    let orders_handle = task::spawn(async move {
        loop {
            match redis_connection_orders
                .pop(RedisQueues::ORDERS.to_string().as_str(), Some(1))
                .await
            {
                Ok(data) => {
                    if data.len() > 0 {
                        let mut engine = engine_orders.lock().await;
                        handle_order(data, &redis_connection_orders, &mut engine).await;
                    }
                }
                Err(error) => {
                    println!("Error popping from orders redis queue: {:?}", error);
                }
            }
        }
    });

    // Spawn a task to handle users concurrently
    let redis_connection_users = Arc::clone(&redis_connection); // Arc clone to share the same connection
    let engine_users = Arc::clone(&engine);
    let users_handle = task::spawn(async move {
        loop {
            match redis_connection_users
                .pop(RedisQueues::USERS.to_string().as_str(), Some(1))
                .await
            {
                Ok(data) => {
                    if data.len() > 0 {
                        let mut engine = engine_users.lock().await;
                        handle_user(data, &redis_connection_users, &mut engine).await;
                    }
                }
                Err(error) => {
                    println!("Error popping from users redis queue: {:?}", error);
                }
            }
        }
    });

    // Await both tasks to run concurrently
    if let Err(e) = orders_handle.await {
        println!("Error in the orders task: {:?}", e);
    }

    if let Err(e) = users_handle.await {
        println!("Error in the users task: {:?}", e);
    }
}
