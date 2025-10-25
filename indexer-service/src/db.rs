use sqlx::PgPool;
use crate::config::Config;
use anyhow::Result;

pub async fn create_db_pool(config: &Config) -> Result<PgPool> {
    let pool = PgPool::connect(&config.db_url)
        .await?;
    Ok(pool)
}