use serde::{ Serialize, Deserialize };

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

impl std::fmt::Display for SubscriptionType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SubscriptionType::depth => write!(f, "depth"),
            SubscriptionType::trade => write!(f, "trade"),
            SubscriptionType::ticker => write!(f, "ticker"),
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
    #[allow(non_camel_case_types)]
    BTC_USDC,
    #[allow(non_camel_case_types)]
    ETH_USDC,
    #[allow(non_camel_case_types)]
    AVAX_USDC,
    #[allow(non_camel_case_types)]
    MATIC_USDC,
}

impl SupportedAssetPairs {
    pub fn from_str(asset_pair_str: &str) -> Result<SupportedAssetPairs, &'static str> {
        match asset_pair_str {
            "BTC_USDT" => Ok(SupportedAssetPairs::BTC_USDT),
            "ETH_USDT" => Ok(SupportedAssetPairs::ETH_USDT),
            "SOL_USDT" => Ok(SupportedAssetPairs::SOL_USDT),
            "SOL_USDC" => Ok(SupportedAssetPairs::SOL_USDC),
            "BTC_USDC" => Ok(SupportedAssetPairs::BTC_USDC),
            "ETH_USDC" => Ok(SupportedAssetPairs::ETH_USDC),
            "AVAX_USDC" => Ok(SupportedAssetPairs::AVAX_USDC),
            "MATIC_USDC" => Ok(SupportedAssetPairs::MATIC_USDC),
            _ => Err("Unsupported asset pair"),
        }
    }
}

impl std::fmt::Display for SupportedAssetPairs {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SupportedAssetPairs::BTC_USDT => write!(f, "BTC_USDT"),
            SupportedAssetPairs::ETH_USDT => write!(f, "ETH_USDT"),
            SupportedAssetPairs::SOL_USDT => write!(f, "SOL_USDT"),
            SupportedAssetPairs::SOL_USDC => write!(f, "SOL_USDC"),
            SupportedAssetPairs::BTC_USDC => write!(f, "BTC_USDC"),
            SupportedAssetPairs::ETH_USDC => write!(f, "ETH_USDC"),
            SupportedAssetPairs::AVAX_USDC => write!(f, "AVAX_USDC"),
            SupportedAssetPairs::MATIC_USDC => write!(f, "MATIC_USDC"),
        }
    }
}