use actix_web::web::{Data, Json};

use chrono;
use serde_json::to_string;
use std::time::Instant;
use uuid::Uuid;

use crate::types::{
    app::AppState,
    routes::{
        CancelAllOrdersInput, CancelOrderInput, CreateOrderInput, GetOpenOrderInput, GetOpenOrdersInput, OrderRequests
    },
};

use redis::RedisQueues;

pub async fn execute_order(
    body: Json<CreateOrderInput>,
    app_state: Data<AppState>,
) -> actix_web::HttpResponse {
    let starttime = Instant::now();
    let mut order = body.into_inner();
    let pubsub_id = Some(Uuid::new_v4());
    order.pubsub_id = pubsub_id;

    let create_order_request = OrderRequests::CreateOrder(order);
    let create_order_data = to_string(&create_order_request).unwrap();
    println!("Create Order: {}", create_order_data);

    let redis_connection = &app_state.redis_connection;

    if let Some(pubsub_id_value) = pubsub_id {
        let result = redis_connection
            .push_and_wait_for_subscriber(
                RedisQueues::ORDERS.to_string(),
                create_order_data,
                pubsub_id_value,
            )
            .await;

        match result {
            Ok(published_data) => {
                let published_data_json: serde_json::Value =
                    serde_json::from_str(&published_data).unwrap();

                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::Ok().json(published_data_json);
            }
            Err(e) => {
                println!("Failed to get created order from redis - {}", e);
                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::InternalServerError().finish();
            }
        }
    }

    println!("Timeout: {:?}", starttime.elapsed());
    actix_web::HttpResponse::Ok().finish()
}

pub async fn get_open_order(
    body: Json<GetOpenOrderInput>,
    app_state: Data<AppState>,
) -> actix_web::HttpResponse {
    let starttime = Instant::now();
    let mut order = body.into_inner();
    let pubsub_id = Some(Uuid::new_v4());
    order.pubsub_id = pubsub_id;

    let get_open_order_request = OrderRequests::GetOpenOrder(order);
    let get_open_order_data = to_string(&get_open_order_request).unwrap();
    println!("Get Open Order: {}", get_open_order_data);

    let redis_connection = &app_state.redis_connection;
    if let Some(pubsub_id_value) = pubsub_id {
        let result = redis_connection
            .push_and_wait_for_subscriber(
                RedisQueues::ORDERS.to_string(),
                get_open_order_data,
                pubsub_id_value,
            )
            .await;

        match result {
            Ok(published_data) => {
                let published_data_json: serde_json::Value =
                    serde_json::from_str(&published_data).unwrap();

                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::Ok().json(published_data_json);
            }
            Err(e) => {
                println!("Failed to get open orders from redis - {}", e);
                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::InternalServerError().finish();
            }
        }
    }

    println!("Timeout: {:?}", starttime.elapsed());

    actix_web::HttpResponse::Ok().finish()
}

pub async fn cancel_order(
    body: Json<CancelOrderInput>,
    app_state: Data<AppState>,
) -> actix_web::HttpResponse {
    let starttime = Instant::now();
    let mut order = body.into_inner();
    let pubsub_id = Some(Uuid::new_v4());
    order.pubsub_id = pubsub_id;

    let cancel_order_request = OrderRequests::CancelOrder(order);
    let cancel_order_data = to_string(&cancel_order_request).unwrap();
    println!("Cancel Order: {}", cancel_order_data);

    let redis_connection = &app_state.redis_connection;
    if let Some(pubsub_id_value) = pubsub_id {
        let result = redis_connection
            .push_and_wait_for_subscriber(
                RedisQueues::ORDERS.to_string(),
                cancel_order_data,
                pubsub_id_value,
            )
            .await;

        match result {
            Ok(published_data) => {
                let published_data_json: serde_json::Value =
                    serde_json::from_str(&published_data).unwrap();

                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::Ok().json(published_data_json);
            }
            Err(e) => {
                println!("Failed to get cancelled order from redis - {}", e);
                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::InternalServerError().finish();
            }
        }
    }

    println!("Timeout: {:?}", starttime.elapsed());
    actix_web::HttpResponse::Ok().finish()
}

pub async fn get_open_orders(
    body: Json<GetOpenOrdersInput>,
    app_state: Data<AppState>,
) -> actix_web::HttpResponse {
    let starttime = Instant::now();
    let mut order = body.into_inner();
    let market = order.market.clone(); // Store market for later use
    let pubsub_id = Some(Uuid::new_v4());
    order.pubsub_id = pubsub_id;

    let get_open_orders_request = OrderRequests::GetOpenOrders(order);
    let get_open_orders_data = to_string(&get_open_orders_request).unwrap();
    println!("Get Open Orders: {}", get_open_orders_data);

    let redis_connection = &app_state.redis_connection;
    if let Some(pubsub_id_value) = pubsub_id {
        let result = redis_connection
            .push_and_wait_for_subscriber(
                RedisQueues::ORDERS.to_string(),
                get_open_orders_data,
                pubsub_id_value,
            )
            .await;

        match result {
            Ok(published_data) => {
                let mut published_data_json: serde_json::Value =
                    serde_json::from_str(&published_data).unwrap();

                // Add market field to each order in the response
                if let Some(orders_array) = published_data_json.as_array_mut() {
                    for order in orders_array.iter_mut() {
                        if let Some(order_obj) = order.as_object_mut() {
                            order_obj.insert("market".to_string(), serde_json::Value::String(market.clone()));
                            // Convert timestamp to created_at string
                            if let Some(timestamp) = order_obj.get("timestamp") {
                                if let Some(ts) = timestamp.as_i64() {
                                    // Convert milliseconds to ISO string
                                    let dt = chrono::DateTime::from_timestamp_millis(ts);
                                    if let Some(dt) = dt {
                                        order_obj.insert("created_at".to_string(), serde_json::Value::String(dt.to_rfc3339()));
                                    }
                                }
                            }
                            // Convert order_status to status
                            if let Some(order_status) = order_obj.get("order_status") {
                                order_obj.insert("status".to_string(), order_status.clone());
                            }
                        }
                    }
                }

                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::Ok().json(published_data_json);
            }
            Err(e) => {
                println!("Failed to get open orders from redis - {}", e);
                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::InternalServerError().finish();
            }
        }
    }

    println!("Timeout: {:?}", starttime.elapsed());

    actix_web::HttpResponse::Ok().finish()
}

pub async fn cancel_all_orders(
    body: Json<CancelAllOrdersInput>,
    app_state: Data<AppState>,
) -> actix_web::HttpResponse {
    let starttime = Instant::now();
    let mut order = body.into_inner();
    let pubsub_id = Some(Uuid::new_v4());
    order.pubsub_id = pubsub_id;

    let cancel_all_orders_request = OrderRequests::CancelAllOrders(order);
    let cancel_all_orders_data = to_string(&cancel_all_orders_request).unwrap();
    println!("Cancel All Orders: {}", cancel_all_orders_data);

    let redis_connection = &app_state.redis_connection;
    if let Some(pubsub_id_value) = pubsub_id {
        let result = redis_connection
            .push_and_wait_for_subscriber(
                RedisQueues::ORDERS.to_string(),
                cancel_all_orders_data,
                pubsub_id_value,
            )
            .await;

        match result {
            Ok(published_data) => {
                let published_data_json: serde_json::Value =
                    serde_json::from_str(&published_data).unwrap();

                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::Ok().json(published_data_json);
            }
            Err(e) => {
                println!("Failed to get all cancelled orders from redis - {}", e);
                println!("Time: {:?}", starttime.elapsed());
                return actix_web::HttpResponse::InternalServerError().finish();
            }
        }
    }

    println!("Timeout: {:?}", starttime.elapsed());
    actix_web::HttpResponse::Ok().finish()
}
