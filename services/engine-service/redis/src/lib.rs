use anyhow::{anyhow, Error};

use fred::{ 
    clients::SubscriberClient, 
    prelude::*
};

pub enum RedisQueue {
    ORDERS,
    USERS,
    DATABASE
}

impl ToString for RedisQueue {
    fn to_string(&self) -> String {
        match self {
            RedisQueue::ORDERS => String::from("orders"),
            RedisQueue::USERS => String::from("users"),
            RedisQueue::DATABASE => String::from("database")
        }
    }
}

pub struct RedisManager {
    pub client: Client,
    pub publisher: Client,
    pub subscriber: SubscriberClient
}

impl RedisManager {
    pub async fn new() -> Result<Self, Error> {
        let redis_url = std::env::var("REDIS_URL").expect("Redis url must be set");

        let config = Config::from_url(redis_url.as_str())
            .expect("Failed to create redis config from url");

        let client = Builder::from_config(config.clone()).build()?;
        let publisher = Builder::from_config(config.clone()).build()?;
        let subscriber = Builder::from_config(config.clone()).build_subscriber_client()?;

        client.init().await?;
        publisher.init().await?;
        subscriber.init().await?;

        Ok(Self {
            client,
            publisher,
            subscriber
        })
    }

    pub async fn push(&self, key: &str, value: String) -> Result<(), fred::error::Error> {
        self.client.lpush(key, value).await
    }

    pub async fn pop(&self, key: &str, count: Option<usize>) -> Result<Vec<Value>, fred::error::Error> {
        self.client.rpop(key, count).await
    }

    pub async fn publish(&self, channel: &str, value: String) -> Result<(), fred::error::Error> {
        self.publisher.publish(channel, value).await
    }

    pub async fn subscribe(&self, channel: &str) -> Result<(), fred::error::Error> {
        self.subscriber.subscribe(channel).await
    }

    pub async fn unsubscribe(&self, channel: &str) -> Result<(), fred::error::Error> {
        self.subscriber.unsubscribe(channel).await
    }

    pub async fn push_and_wait_for_subscriber(&self, key: &str, value: String, channel: &str) -> Result<String, Error> {
        let channel = channel.to_string();
        let channel_ref = channel.as_str();

        self.subscribe(channel_ref).await.map_err(|e| {
            println!("Couldn't subscribe to channel - {}", e);
            anyhow!("Couldn't subscribe to channel: {}", e)
        })?;

        self.push(key, value).await.map_err(|e| {
            println!("Couldn't push into queue - {}", e);
            anyhow!("Couldn't push into queue: {}", e)
        })?;

        let mut message_stream = self.subscriber.message_rx();

        match message_stream.recv().await {
            Ok(message) => {
                println!("Recv {:?} on channel {}", message.value, message.channel);
                let published_message: String = message.value.convert()?;

                let _ = self.unsubscribe(channel_ref).await;
                Ok(published_message)
            }
            Err(e) => {
                println!("Error receiving message: {}", e);
                Err(anyhow!("Error receiving message: {}", e))
            }
        }
    }
}

