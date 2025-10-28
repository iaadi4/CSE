use futures_util::SinkExt;
use redis::RedisManager;
use tokio_tungstenite::tungstenite::Message;

use crate::{
    types::{WsMessage, WsResponse},
    user::User,
};
use std::collections::HashMap;

pub struct WsManager {
    pub users: HashMap<String, User>,
    pub subscriptions: HashMap<String, Vec<String>>, // user_id -> [subscription_id]
    pub reverse_subscriptions: HashMap<String, Vec<String>>, // subscription_id -> [user_id]
    pub redis_connection: RedisManager,
}

impl WsManager {
    pub async fn new() -> Self {
        Self {
            users: HashMap::new(),
            subscriptions: HashMap::new(),
            reverse_subscriptions: HashMap::new(),
            redis_connection: RedisManager::new().await.unwrap(),
        }
    }

    pub fn add_user(&mut self, user: User) {
        self.users.insert(user.id.clone(), user);
    }

    pub fn remove_user(&mut self, id: &str) {
        self.users.remove(id);
        self.subscriptions.remove(id);

        for (_, subscriptions) in self.reverse_subscriptions.iter_mut() {
            subscriptions.retain(|user_id| user_id != id);
        }
    }

    // {"method":"SUBSCRIBE","params":["trade.BTC_USDT"],"id":1}
    pub async fn subscribe(&mut self, user_id: &str, message: WsMessage) {
        if message.method == "SUBSCRIBE" {
            let (subscription_type, asset_pair) = match message.parse_subscription() {
                Some(result) => result,
                None => {
                    eprintln!("Invalid subscription format: {:?}", message.params);
                    return;
                }
            };
            let subscription_id = format!("{:?}.{:?}", subscription_type, asset_pair);

            if let Some(subscriptions) = self.subscriptions.get_mut(user_id) {
                subscriptions.push(subscription_id.clone());
            } else {
                self.subscriptions
                    .insert(user_id.to_string(), vec![subscription_id.clone()]);
            }

            if let Some(users) = self.reverse_subscriptions.get_mut(&subscription_id) {
                users.push(user_id.to_string());
            } else {
                self.reverse_subscriptions
                    .insert(subscription_id.clone(), vec![user_id.to_string()]);

                self.redis_connection
                    .subscribe(subscription_id.as_str())
                    .await
                    .expect("Failed to subscribe in redis");
            }
        }
    }

    // {"method":"UNSUBSCRIBE","params":["trade.BTC_USDT"],"id":1}
    pub async fn unsubscribe(&mut self, user_id: &str, message: WsMessage) {
        if message.method == "UNSUBSCRIBE" {
            let (subscription_type, asset_pair) = match message.parse_subscription() {
                Some(result) => result,
                None => {
                    eprintln!("Invalid unsubscription format: {:?}", message.params);
                    return;
                }
            };
            let subscription_id = format!("{:?}.{:?}", subscription_type, asset_pair);

            if let Some(subscriptions) = self.subscriptions.get_mut(user_id) {
                subscriptions.retain(|id| id != &subscription_id);
            }

            if let Some(users) = self.reverse_subscriptions.get_mut(&subscription_id) {
                users.retain(|id| id != user_id);

                if users.is_empty() {
                    self.reverse_subscriptions.remove(&subscription_id);
                    self.redis_connection
                        .unsubscribe(subscription_id.as_str())
                        .await
                        .expect("Failed to unsubscribe in redis");
                }
            }
        }
    }

    // {"data":{"E":1727866324128584,"T":1727866324088922,"U":4977146,"a":[["1.0003","0"]],"b":[],"e":"depth","s":"BTC_USDT","u":4977146},"stream":"depth.BTC_USDT"}
    pub async fn send_to_ws_stream(&mut self, message: String) {
        let ws_message: WsResponse = serde_json::from_str(message.as_str()).unwrap();

        if let Some(users) = self.reverse_subscriptions.get(ws_message.stream.as_str()) {
            for user_id in users {
                if let Some(user) = self.users.get_mut(user_id) {
                    let user_ws_stream = &mut user.ws_stream;
                    user_ws_stream
                        .send(Message::Text(message.clone()))
                        .await
                        .unwrap();
                }
            }
        }
    }
}
