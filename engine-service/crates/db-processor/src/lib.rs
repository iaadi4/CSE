pub mod query;
pub mod types;

use fred::prelude::RedisValue;
use query::{insert_order, insert_trade};
use reqwest::Client;
use rust_decimal::prelude::ToPrimitive;
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
            DatabaseRequests::InsertTrade(db_trade) => {
                println!("Received Trade {:?}", db_trade);
                match insert_trade(pg_pool, db_trade.clone()).await {
                    Ok(_) => {
                        // Trade inserted successfully, now update balances
                        if let Err(e) = update_balances_after_trade(&db_trade).await {
                            println!("Failed to update balances after trade: {:?}", e);
                        }
                    }
                    Err(e) => println!("Failed to insert trade: {:?}", e),
                }
            }
            DatabaseRequests::InsertOrder(db_data) => {
                println!("Received Order {:?}", db_data);
                let _ = insert_order(pg_pool, db_data).await;
            }
        },
        Err(err) => {
            println!("Failed to deserialize db request: {:?}", err);
        }
    }
}

async fn update_balances_after_trade(trade: &types::DbTrade) -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    let user_service_url = std::env::var("USER_SERVICE_URL").unwrap_or_else(|_| "http://localhost:3001".to_string());

    let quantity = trade.quantity.to_f64().ok_or("Invalid quantity")?;
    let total_price = (trade.price * trade.quantity).to_f64().ok_or("Invalid price")?;

    match trade.order_side.as_str() {
        "BUY" => {
            // Update buyer's balances (current user) - unlock quote asset and add base asset
            unlock_funds(&client, &user_service_url, &trade.user_id, &trade.quote_asset, total_price).await?;
            update_balance(&client, &user_service_url, &trade.user_id, &trade.base_asset, quantity, "add").await?;

            // Update seller's balances (other user) - unlock base asset and add quote asset
            unlock_funds(&client, &user_service_url, &trade.other_user_id, &trade.base_asset, quantity).await?;
            update_balance(&client, &user_service_url, &trade.other_user_id, &trade.quote_asset, total_price, "add").await?;
        }
        "SELL" => {
            // Update seller's balances (current user) - unlock base asset and add quote asset
            unlock_funds(&client, &user_service_url, &trade.user_id, &trade.base_asset, quantity).await?;
            update_balance(&client, &user_service_url, &trade.user_id, &trade.quote_asset, total_price, "add").await?;

            // Update buyer's balances (other user) - unlock quote asset and add base asset
            unlock_funds(&client, &user_service_url, &trade.other_user_id, &trade.quote_asset, total_price).await?;
            update_balance(&client, &user_service_url, &trade.other_user_id, &trade.base_asset, quantity, "add").await?;
        }
        _ => return Err("Invalid order side".into()),
    }

    Ok(())
}

async fn unlock_funds(
    client: &Client,
    base_url: &str,
    user_id: &str,
    asset: &str,
    amount: f64,
) -> Result<(), Box<dyn std::error::Error>> {
    let url = format!("{}/api/balance/unlock-funds", base_url);
    let body = serde_json::json!({
        "userId": user_id,
        "asset": asset,
        "amount": amount
    });

    let response = client.post(&url).json(&body).send().await?;
    if !response.status().is_success() {
        return Err(format!("Failed to unlock funds: {}", response.status()).into());
    }

    Ok(())
}

async fn update_balance(
    client: &Client,
    base_url: &str,
    user_id: &str,
    asset: &str,
    amount: f64,
    operation: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let url = format!("{}/api/balance/update", base_url);
    let body = serde_json::json!({
        "userId": user_id,
        "asset": asset,
        "amount": amount,
        "operation": operation
    });

    let response = client.post(&url).json(&body).send().await?;
    if !response.status().is_success() {
        return Err(format!("Failed to update balance: {}", response.status()).into());
    }

    Ok(())
}
