use anyhow::Error;
use uuid::Uuid;

use fred::types::RedisConfig;
use fred::{ clients::SubscriberClient, prelude::* };

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
    pub client: RedisClient,
    pub publisher: RedisClient,
    pub subscriber: SubscriberClient
}

impl RedisManager {
    pub async fn new() -> Result<Self, RedisError> {
        let redis_url = std::env::var("REDIS_URL").expect("Redis url must be set");

        let config = RedisConfig::from_url(redis_url.as_str())
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

    pub async fn push(&self, key: &str, value: String) -> Result<(), RedisError> {
        self.client.lpush(key, value).await
    }

    pub async fn pop(&self, key: &str, count: Option<usize>) -> Result<Vec<RedisValue>, RedisError> {
        self.client.rpop(key, count).await
    }

    pub async fn publish(&self, channel: &str, value: String) -> Result<(), RedisError> {
        self.publisher.publish(channel, value).await
    }

    pub async fn subscribe(&self, channel: &str) -> Result<(), RedisError> {
        self.subscriber.subscribe(channel).await
    }

    pub async fn unsubscribe(&self, channel: &str) -> Result<(), RedisError> {
        self.subscriber.unsubscribe(channel).await
    }

    pub async fn push_and_wait_for_subscriber(&self, key: &str, value: String, channel: &str) -> Result<String, Error> {
        let channel = channel.to_string();
        let channel_ref = channel.as_str();

        self.subscribe(channel_ref).await.map_err(|e| {
            println!("Couldn't push into queue - {}", e);
            Error
        })?;

        self.push(key.as_str(), value).await.map_err(|e| {
            println!("Couldn't push into queue - {}", e);
            Error
        })?;

        let mut message_stream = self.subscriber.message_rx();

        if let Some(message) = message_stream.recv().await {
            println!("Recv {:?} on channel {}", message.value, message.channel);
            let published_message: String = message.value.convert()?;

            let _ = self.unsubscribe(channel_ref).await;
            return Ok(published_message);
        }

        Err(Error)
    }
}

