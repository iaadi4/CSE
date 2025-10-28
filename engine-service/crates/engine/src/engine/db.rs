use super::engine::Engine;
use crate::types::{
    db::{DatabaseRequests, DbTrade},
    engine::{Fill, Order},
};
use async_trait::async_trait;
use redis::{RedisManager, RedisQueues};
use rust_decimal::Decimal;
use serde_json::to_string;

#[async_trait]
pub trait DbUpdates {
    async fn update_db_orders(
        &self,
        order: Order,
        executed_quantity: Decimal,
        fills: &Vec<Fill>,
        redis_conn: &RedisManager,
    );
    async fn create_db_trades(
        &self,
        user_id: String,
        market: String,
        fills: &Vec<Fill>,
        redis_conn: &RedisManager,
    );
}

#[async_trait]
impl DbUpdates for Engine {
    async fn update_db_orders(
        &self,
        order: Order,
        executed_quantity: Decimal,
        fills: &Vec<Fill>,
        redis_conn: &RedisManager,
    ) {
        let _ = (order, executed_quantity, fills, redis_conn);
    }

    async fn create_db_trades(
        &self,
        user_id: String,
        market: String,
        fills: &Vec<Fill>,
        redis_conn: &RedisManager,
    ) {
        for fill in fills.iter() {
            let db_trade = DbTrade {
                trade_id: fill.trade_id,
                price: fill.price,
                quantity: fill.quantity,
                market: market.clone(),
                user_id: user_id.clone(),
                other_user_id: fill.other_user_id.clone(),
                order_id: fill.order_id.clone(),
                timestamp: chrono::Utc::now().timestamp_millis(),
            };

            let create_db_trade_request = DatabaseRequests::InsertTrade(db_trade);
            let create_db_trade_data = to_string(&create_db_trade_request).unwrap();
            let _ = redis_conn
                .push(
                    RedisQueues::DATABASE.to_string().as_str(),
                    create_db_trade_data,
                )
                .await
                .map_err(|e| {
                    println!("Couldn't push into database queue - {}", e);
                });
        }
    }
}
