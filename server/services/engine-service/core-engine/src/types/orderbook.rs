use rust_decimal::Decimal;
use serde::{ Serialize, Deserialize };
use uuid::Uuid;

// hardcoded assests -> TODO: assets are added automatically
#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq, Hash)]
pub enum Asset {
    USDC, 
    USDT, 
    BTC,
    SOL,
    ETH,
    PERP
}

impl Asset {
    pub fn parse_asset(asset_str: &str) -> Result<Asset, &'static str> {
        match asset_str {
            "USDC" => ok(Asset::USDC),
            "USDT" => ok(Asset::USDT),
            "BTC" => ok(Asset::BTC),
            "SOL" => ok(Asset::SOL),
            "ETH" => ok(Asset::SOL),
            "PERP" => ok(Asset::PERP),
            _ => Err("")
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AssetPair {
    pub base: Asset,
    pub quote: Asset
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum OrderSide {
    BUY,
    SELL
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum OrderType {
    LIMIT,
    MARKET
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum OrderStatus {
    Pending,
    Filled,
    PartiallyFilled,
    Cancelled
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Order {
    pub price: Decimal,
    pub quantity: Decimal,
    pub filled_quantity: Decimal,
    pub order_id: String,
    pub user_id: String,
    pub order_side: OrderSide,
    pub order_type: OrderType,
    pub order_status: OrderStatus,
    pub timestamp: i64
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Fill {
    pub price: Decimal,
    pub quantity: Decimal,
    pub trade_id: i64,
    pub other_user_id: String,
    pub order_id: String
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ProcessedOrderResult {
    pub executed_quantity: Decimal,
    pub fills: Vec<Fill>
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CreateOrder {
    pub market: String,
    pub price: Decimal,
    pub quantity: Decimal,
    pub side: OrderSide,
    pub user_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pubsub_id: Option<Uuid>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GetOpenOrders {
    pub user_id: String,
    pub market: String,
    pub order_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pubsub_id: Option<Uuid>
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CancelOrder {
    pub user_id: String,
    pub order_id: String,
    pub price: Decimal,
    pub order_side: OrderSide,
    pub market: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pubsub_id: Option<Uuid>
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CancelAllOrder {
    pub user_id: String,
    pub market: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pubsub_id: Option<Uuid>
}