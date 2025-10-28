use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct WsResponse {
    pub stream: String,
    pub data: serde_json::Value, // any kind of JSON-like data - initialise using serde_json::json! macro
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct WsMessage {
    pub method: String,
    pub params: Vec<String>,
    pub id: u32,
}

impl WsMessage {
    pub fn parse_subscription(&self) -> Option<(SubscriptionType, SupportedAssetPairs)> {
        if self.params.is_empty() {
            return None;
        }

        let subscription_id = &self.params[0];
        let parts: Vec<&str> = subscription_id.split('.').collect();

        if parts.len() != 2 {
            return None;
        }

        let subscription_type_str = parts[0];
        let asset_pair_str = parts[1];

        let subscription_type = SubscriptionType::from_str(subscription_type_str)?;
        let asset_pair = SupportedAssetPairs::from_str(asset_pair_str).ok()?;

        Some((subscription_type, asset_pair))
    }
}

#[derive(Debug, Clone)]
pub enum SubscriptionType {
    #[allow(non_camel_case_types)]
    depth,
    #[allow(non_camel_case_types)]
    trade,
    #[allow(non_camel_case_types)]
    ticker,
}

impl SubscriptionType {
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "depth" => Some(SubscriptionType::depth),
            "trade" => Some(SubscriptionType::trade),
            "ticker" => Some(SubscriptionType::ticker),
            _ => None,
        }
    }
}

#[derive(Debug, Clone)]
pub enum SupportedAssetPairs {
    #[allow(non_camel_case_types)]
    BTC_USDT,
    #[allow(non_camel_case_types)]
    ETH_USDT,
    #[allow(non_camel_case_types)]
    SOL_USDT,
    #[allow(non_camel_case_types)]
    SOL_USDC,
}

impl SupportedAssetPairs {
    pub fn from_str(asset_pair_str: &str) -> Result<SupportedAssetPairs, &'static str> {
        match asset_pair_str {
            "BTC_USDT" => Ok(SupportedAssetPairs::BTC_USDT),
            "ETH_USDT" => Ok(SupportedAssetPairs::ETH_USDT),
            "SOL_USDT" => Ok(SupportedAssetPairs::SOL_USDT),
            "SOL_USDC" => Ok(SupportedAssetPairs::SOL_USDC),
            _ => Err("Unsupported asset pair"),
        }
    }
}
