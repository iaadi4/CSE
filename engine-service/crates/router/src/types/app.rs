use redis::RedisManager;
use sqlx_postgres::PostgresDb;

pub struct AppState {
    pub redis_connection: RedisManager,
    pub postgres_db: PostgresDb,
}
