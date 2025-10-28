use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OrderSide {
    BUY,
    SELL,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateOrderInput {
    market: String,
    price: Decimal,
    quantity: Decimal,
    side: OrderSide,
    user_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pubsub_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetOpenOrderInput {
    user_id: String,
    order_id: String,
    market: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pubsub_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CancelOrderInput {
    order_id: String,
    user_id: String,
    price: Decimal,
    side: OrderSide,
    market: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pubsub_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetOpenOrdersInput {
    user_id: String,
    market: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pubsub_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CancelAllOrdersInput {
    user_id: String,
    market: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pubsub_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetDepthInput {
    pub symbol: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pubsub_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetTradesInput {
    pub symbol: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")] // frontend uses camelCase, will be renamed to snake_case in the backend
pub struct GetKlinesInput {
    pub symbol: String,
    pub interval: String,
    // #[serde(rename = "startTime")]  // can also use only this line to rename the field
    pub start_time: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OrderRequests {
    CreateOrder(CreateOrderInput),
    GetOpenOrder(GetOpenOrderInput),
    CancelOrder(CancelOrderInput),
    GetOpenOrders(GetOpenOrdersInput),
    CancelAllOrders(CancelAllOrdersInput),
    GetDepth(GetDepthInput),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUserInput {
    pub user_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pubsub_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UserRequests {
    CreateUser(CreateUserInput),
}
