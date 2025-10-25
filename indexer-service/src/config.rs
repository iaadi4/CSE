use dotenvy::dotenv;

pub struct Config {
    pub db_url: String,
    pub solana_rpc: String,
    pub ethereum_rpc: String,
    pub bitcoin_rpc: String,
    pub master_seed_mnemonic: String
}

impl Config {
    pub fn from_env() -> Self {
        dotenv.ok();
        Self {
            db_url: env::var("DATABASE_URL").expect("database url must be set!"),
            solana_rpc: env::var("SOLANA_RPC").expect("solana rpc must be set!"),
            ethereum_rpc: env::var("ETHEREUM_RPC").expect("ethereum rpc must be set!"),
            bitcoin_rpc: env::var("BITCOIN_RPC").expect("bitcoin rpc must be set!"),
            master_seed_mnemonic: env::var("MASTER_SEED_MNEMONIC").expect("master seed mnemonic must be set!")
        }
    }
}