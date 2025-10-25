mod chains;

use chains::solana;
use sqlx::PgPool;
use dotenv::dotenv;
use std::env;
use tokio;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL")?;
    println!("Connected to database");

    println!("Starting Solana indexer...");
    solana::start_indexer().await?;

    Ok(())
}
