use super::engine::Engine;
use crate::types::{
    db::{DatabaseRequests, DbOrder, DbTrade},
    engine::{Fill, Order, OrderSide},
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
        market: String,
        executed_quantity: Decimal,
        fills: &Vec<Fill>,
        redis_conn: &RedisManager,
    );
    async fn create_db_trades(
        &self,
        user_id: String,
        market: String,
        order_side: OrderSide,
        base_asset: String,
        quote_asset: String,
        fills: &Vec<Fill>,
        redis_conn: &RedisManager,
    );
}

#[async_trait]
impl DbUpdates for Engine {
    async fn update_db_orders(
        &self,
        order: Order,
        market: String,
        executed_quantity: Decimal,
        _fills: &Vec<Fill>,
        redis_conn: &RedisManager,
    ) {
        let db_order = DbOrder {
            order_id: order.order_id,
            market,
            price: order.price,
            quantity: order.quantity,
            filled_quantity: order.filled_quantity + executed_quantity,
            user_id: order.user_id,
            side: format!("{:?}", order.side),
            order_type: format!("{:?}", order.order_type),
            order_status: format!("{:?}", order.order_status),
            timestamp: order.timestamp,
        };

        let create_db_order_request = DatabaseRequests::InsertOrder(db_order);
        let create_db_order_data = to_string(&create_db_order_request).unwrap();
        let _ = redis_conn
            .push(
                RedisQueues::DATABASE.to_string().as_str(),
                create_db_order_data,
            )
            .await
            .map_err(|e| {
                println!("Couldn't push order into database queue - {}", e);
            });
    }

    async fn create_db_trades(
        &self,
        user_id: String,
        market: String,
        order_side: OrderSide,
        base_asset: String,
        quote_asset: String,
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
                order_side: format!("{:?}", order_side),
                base_asset: base_asset.clone(),
                quote_asset: quote_asset.clone(),
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
