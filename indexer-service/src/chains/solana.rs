use solana_client::nonblocking::pubsub_client::PubsubClient;
use solana_sdk::pubkey::Pubkey;
use std::env;
use tokio_stream::StreamExt;

pub async fn start_indexer() -> anyhow::Result<()> {
    let hot_wallet = env::var("HOT_WALLET_ADDRESS")?;
    let solana_ws_url = env::var("SOLANA_WS_URL")?;

    let client = PubsubClient::new(&solana_ws_url).await?;

    let (mut receiver, _unsubscribe) = client
        .account_subscribe(&hot_wallet.parse::<Pubkey>()?, None)
        .await?;

    println!("Listening for transactions on hot wallet: {}", hot_wallet);

    while let Some(response) = receiver.next().await {
        let account_info = response.value;
        println!("Account info updated: {:?}", account_info);
    }

    Ok(())
}