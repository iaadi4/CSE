// use super::Asset;

// #[derive(Debug)]
// pub enum AssetError {
//     UnsupportedAsset,
// }

// impl std::fmt::Display for AssetError {
//     fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
//         match self {
//             AssetError::UnsupportedAsset => write!(f, "Unsupported asset"),
//         }
//     }
// }

// impl std::error::Error for AssetError {}

// impl Asset {
//     pub fn from_str(asset_str: &str) -> Result<Asset, AssetError> {
//         match asset_str {
//             "USDC" => Ok(Asset::USDC),
//             "USDT" => Ok(Asset::USDT),
//             "BTC" => Ok(Asset::BTC),
//             "ETH" => Ok(Asset::ETH),
//             "SOL" => Ok(Asset::SOL),
//             _ => Err(AssetError::UnsupportedAsset),
//         }
//     }
// }
