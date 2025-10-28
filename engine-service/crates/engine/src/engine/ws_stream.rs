use super::engine::Engine;
use crate::types::{
    engine::{Fill, OrderSide},
    ws_stream::WsResponse,
};
use async_trait::async_trait;
use redis::RedisManager;
use rust_decimal::Decimal;

#[async_trait]
pub trait WsStreamUpdates {
    async fn publish_ws_trades(
        &self,
        market: String,
        user_id: String,
        fills: &Vec<Fill>,
        timestamp: i64,
        redis_conn: &RedisManager,
    );

    async fn publish_ws_depth_updates(
        &mut self,
        market: String,
        price: Decimal,
        side: OrderSide,
        fills: &Vec<Fill>,
        redis_conn: &RedisManager,
    );
}

#[async_trait]
impl WsStreamUpdates for Engine {
    async fn publish_ws_trades(
        &self,
        market: String,
        user_id: String,
        fills: &Vec<Fill>,
        timestamp: i64,
        redis_conn: &RedisManager,
    ) {
        for fill in fills.iter() {
            let stream = format!("trade.{}", market);
            let data = serde_json::json!({
                "e": "trade",
                "t": fill.trade_id,
                "m": fill.other_user_id == user_id, // check this
                "p": fill.price,
                "q": fill.quantity,
                "s": market,
                "T": timestamp,
            });

            let ws_response = WsResponse {
                stream: stream.clone(),
                data,
            };
            let ws_response_string = serde_json::to_string(&ws_response).unwrap();

            let result = redis_conn
                .publish(stream.as_str(), ws_response_string)
                .await;

            if let Err(e) = result {
                eprintln!("Error publishing to redis: {}", e);
            }
        }
    }

    async fn publish_ws_depth_updates(
        &mut self,
        market: String,
        price: Decimal,
        side: OrderSide,
        fills: &Vec<Fill>,
        redis_conn: &RedisManager,
    ) {
        let orderbook = match self
            .orderbooks
            .iter_mut()
            .find(|orderbook| orderbook.ticker() == market)
        {
            Some(ob) => ob,
            None => {
                eprintln!("No matching orderbook found for market: {}", market);
                return;
            }
        };

        let depth = orderbook.get_depth();
        let depth_bids = depth.0;
        let depth_asks = depth.1;

        match side {
            OrderSide::BUY => {
                // if buy, asks would be filled, so we'd need to update quantity for these prices on frontend
                // for bids, only the order price bid would be filled
                let updated_asks = depth_asks
                    .into_iter()
                    .filter(|ask| fills.iter().any(|fill| fill.price == ask.0))
                    .collect::<Vec<(Decimal, Decimal)>>();
                let updated_bids = depth_bids
                    .into_iter()
                    .filter(|bid| bid.0 == price)
                    .collect::<Vec<(Decimal, Decimal)>>();

                let stream = format!("depth.{}", market);
                let data = serde_json::json!({
                    "e": "depth",
                    "s": market,
                    "b": updated_bids,
                    "a": updated_asks,
                });

                let ws_response = WsResponse {
                    stream: stream.clone(),
                    data,
                };

                let ws_response_string = serde_json::to_string(&ws_response).unwrap();

                let result = redis_conn
                    .publish(stream.as_str(), ws_response_string)
                    .await;

                if let Err(e) = result {
                    eprintln!("Error publishing to redis: {}", e);
                }
            }
            OrderSide::SELL => {
                // if sell, bids would be filled, so we'd need to update quantity for these prices on frontend
                // for asks, only the order price ask would be filled
                let updated_bids = depth_bids
                    .into_iter()
                    .filter(|bid| fills.iter().any(|fill| fill.price == bid.0))
                    .collect::<Vec<(Decimal, Decimal)>>();
                let updated_asks = depth_asks
                    .into_iter()
                    .filter(|ask| ask.0 == price)
                    .collect::<Vec<(Decimal, Decimal)>>();

                let stream = format!("depth.{}", market);
                let data = serde_json::json!({
                    "e": "depth",
                    "s": market,
                    "b": updated_bids,
                    "a": updated_asks,
                });

                let ws_response = WsResponse {
                    stream: stream.clone(),
                    data,
                };

                let ws_response_string = serde_json::to_string(&ws_response).unwrap();

                let result = redis_conn
                    .publish(stream.as_str(), ws_response_string)
                    .await;

                if let Err(e) = result {
                    eprintln!("Error publishing to redis: {}", e);
                }
            }
        }
    }
}
