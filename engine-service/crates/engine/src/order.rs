use crate::{types::engine::OrderRequests, Engine};
use fred::prelude::RedisValue;
use redis::RedisManager;
use serde_json::from_str;

pub async fn handle_order(
    data: Vec<RedisValue>,
    redis_connection: &RedisManager,
    engine: &mut Engine,
) {
    let order_to_process = &data[0];

    // Convert the RedisValue to a string
    let order_data = match order_to_process {
        RedisValue::String(s) => s.to_string(),
        // BYTES TYPE - NOT NEEDED FOR NOW - check if this can make it faster
        RedisValue::Bytes(b) => String::from_utf8(b.to_vec()).unwrap_or_else(|_| "".to_string()),
        _ => {
            println!("Unexpected Redis value type");
            return;
        }
    };

    // Now you can deserialize it using serde_json
    match from_str::<OrderRequests>(&order_data) {
        Ok(order) => match order {
            OrderRequests::CreateOrder(order) => {
                println!("Create Order: {:?}", order);
                let pubsub_id = order.pubsub_id.unwrap().to_string();
                let pubsub_id_ref = pubsub_id.as_str();

                let create_order_result = engine.create_order(order, redis_connection).await;

                match create_order_result {
                    Ok(order_id) => {
                        let create_order_json = serde_json::json!({
                            "status": "Created Order",
                            "order_id": order_id,
                        });

                        let create_order_string =
                            serde_json::to_string(&create_order_json).unwrap();

                        let _ = redis_connection
                            .publish(pubsub_id_ref, create_order_string)
                            .await;

                        println!("Successfully placed order!")
                    }
                    Err(str) => {
                        let create_order_json = serde_json::json!({
                            "status": "Failed to Create Order",
                        });

                        let create_order_string =
                            serde_json::to_string(&create_order_json).unwrap();

                        let _ = redis_connection
                            .publish(pubsub_id_ref, create_order_string)
                            .await;

                        println!("Order creation failed - {}", str)
                    }
                }
            }

            OrderRequests::GetOpenOrder(open_order) => {
                println!("Get Open Order: {:?}", open_order);
                let pubsub_id = open_order.pubsub_id.unwrap().to_string();
                let pubsub_id_ref = pubsub_id.as_str();

                let open_order_result = engine.get_open_order(open_order);

                match open_order_result {
                    Ok(open_order) => {
                        let open_order_json = serde_json::json!(open_order);

                        let open_order_string = serde_json::to_string(&open_order_json).unwrap();

                        let _ = redis_connection
                            .publish(pubsub_id_ref, open_order_string)
                            .await;
                        println!("Successfully retrieved open order!")
                    }
                    Err(()) => {
                        let open_order_json = serde_json::json!({
                            "status": "Failed to Retrieve Open Order",
                        });

                        let open_order_string = serde_json::to_string(&open_order_json).unwrap();

                        let _ = redis_connection
                            .publish(pubsub_id_ref, open_order_string)
                            .await;
                        println!("Order retrieval failed")
                    }
                }
            }

            OrderRequests::CancelOrder(cancel_order) => {
                println!("Cancel Order: {:?}", cancel_order);
                let pubsub_id = cancel_order.pubsub_id.unwrap().to_string();
                let pubsub_id_ref = pubsub_id.as_str();

                let cancel_order_result = engine.cancel_order(cancel_order);

                match cancel_order_result {
                    Ok(cancel_order_id) => {
                        let cancel_order_json = serde_json::json!({
                            "status": "Cancelled Order",
                            "order_id": cancel_order_id,
                        });

                        let cancel_order_string =
                            serde_json::to_string(&cancel_order_json).unwrap();

                        let _ = redis_connection
                            .publish(pubsub_id_ref, cancel_order_string)
                            .await;
                        println!("Successfully cancelled order!")
                    }
                    Err(str) => {
                        let cancel_order_json = serde_json::json!({
                            "status": "Failed to Cancel Order",
                        });

                        let cancel_order_string =
                            serde_json::to_string(&cancel_order_json).unwrap();

                        let _ = redis_connection
                            .publish(pubsub_id_ref, cancel_order_string)
                            .await;
                        println!("Order cancellation failed - {}", str)
                    }
                }
            }

            OrderRequests::GetOpenOrders(open_orders) => {
                println!("Open Order: {:?}", open_orders);
                let pubsub_id = open_orders.pubsub_id.unwrap().to_string();
                let pubsub_id_ref = pubsub_id.as_str();

                let open_orders_vec = engine.get_open_orders(open_orders);
                let open_orders_string = serde_json::to_string(&open_orders_vec).unwrap();

                let _ = redis_connection
                    .publish(pubsub_id_ref, open_orders_string)
                    .await;
                println!("Successfully retrieved open orders!");
            }

            OrderRequests::CancelAllOrders(cancel_all_orders) => {
                println!("Cancel All Orders: {:?}", cancel_all_orders);
                let user_id = cancel_all_orders.user_id.clone();
                let pubsub_id = cancel_all_orders.pubsub_id.unwrap().to_string();
                let pubsub_id_ref = pubsub_id.as_str();

                let cancel_all_orders_result = engine.cancel_all_orders(cancel_all_orders);

                match cancel_all_orders_result {
                    Ok(_) => {
                        let cancel_all_orders_json = serde_json::json!({
                            "status": "Cancelled All Orders",
                            "user_id": user_id,
                        });

                        let cancel_all_orders_string =
                            serde_json::to_string(&cancel_all_orders_json).unwrap();

                        let _ = redis_connection
                            .publish(pubsub_id_ref, cancel_all_orders_string)
                            .await;
                        println!("Successfully cancelled all orders!")
                    }
                    Err(str) => {
                        let cancel_all_orders_json = serde_json::json!({
                            "status": "Failed to Cancel All Orders",
                        });

                        let cancel_all_orders_string =
                            serde_json::to_string(&cancel_all_orders_json).unwrap();

                        let _ = redis_connection
                            .publish(pubsub_id_ref, cancel_all_orders_string)
                            .await;
                        println!("Order cancellation failed - {}", str)
                    }
                }
            }

            OrderRequests::GetDepth(depth) => {
                println!("Get Depth: {:?}", depth);
                let pubsub_id = depth.pubsub_id.unwrap().to_string();
                let pubsub_id_ref = pubsub_id.as_str();

                let depth_result = engine.get_depth(depth);
                let depth_json = serde_json::json!({
                    "bids": depth_result.0,
                    "asks": depth_result.1,
                });

                let depth_string = serde_json::to_string(&depth_json).unwrap();

                let _ = redis_connection.publish(pubsub_id_ref, depth_string).await;
                println!("Successfully retrieved depth!");
            }
        },
        Err(err) => {
            println!("Failed to deserialize order request: {:?}", err);
        }
    }
}
