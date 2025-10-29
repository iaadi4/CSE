use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DatabaseRequests {
    InsertTrade(DbTrade),
    InsertOrder(DbOrder),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbTrade {
    pub trade_id: i64,
    pub market: String,
    pub price: Decimal,
    pub quantity: Decimal,
    pub user_id: String,
    pub other_user_id: String,
    pub order_id: String,
    pub timestamp: i64,
    // Additional fields for balance updates
    #[serde(default)]
    pub order_side: String,
    #[serde(default)]
    pub base_asset: String,
    #[serde(default)]
    pub quote_asset: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbOrder {
    pub order_id: String,
    pub market: String,
    pub price: Decimal,
    pub quantity: Decimal,
    pub filled_quantity: Decimal,
    pub user_id: String,
    pub side: String,
    pub order_type: String,
    pub order_status: String,
    pub timestamp: i64,
}
