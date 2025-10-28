use db_processor::handle_db_updates;
use redis::{RedisManager, RedisQueues};
use sqlx_postgres::PostgresDb;
pub mod query;
pub mod seed;
pub mod types;

#[tokio::main]
async fn main() {
    let redis_connection = RedisManager::new().await.unwrap();
    println!("Redis connected!");

    let postgres = PostgresDb::new().await.unwrap();
    let pg_pool = postgres.get_pg_connection().unwrap();
    println!("Postgres connection pool ready!");

    // // update DATABASE_URL in sqlx_postgres to run the script
    // if let Err(e) = generate_random_trades(&pg_pool, 100000).await {
    //     println!("Error generating trades: {:?}", e);
    // }

    loop {
        match redis_connection
            .pop(RedisQueues::DATABASE.to_string().as_str(), Some(1))
            .await
        {
            Ok(data) => {
                if data.len() > 0 {
                    handle_db_updates(data, &pg_pool).await;
                }
            }
            Err(error) => {
                println!("Error popping from Redis: {:?}", error);
            }
        }
    }
}
