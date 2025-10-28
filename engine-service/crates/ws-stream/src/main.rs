use fred::prelude::*;
use futures_util::StreamExt;
use std::io::Error;
use std::{sync::Arc, thread};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::Mutex; // need to use this instead of std::sync::Mutex because we are in an async context
use types::WsMessage;
use tokio_tungstenite::tungstenite::Error as WsError;

pub mod types;
pub mod user;
pub mod ws_manager;

use user::User;
use ws_manager::WsManager;

#[tokio::main]
async fn main() -> Result<(), Error> {
    let addr = std::env::var("WS_STREAM_URL").expect("WS_STREAM_URL must be set");

    // Create the event loop and TCP listener we'll accept connections on.
    let try_socket = TcpListener::bind(&addr).await;
    let listener = try_socket.expect("Failed to bind");

    let ws_manager = Arc::new(Mutex::new(WsManager::new().await));

    let ws_manager_clone = ws_manager.clone();
    thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(process_redis_message(ws_manager_clone));
    });
    // thread::spawn can't work with async functions directly since it doesn't understand Futures.
    // By creating a new tokio runtime inside the thread, we can execute the async task within this non-async context.

    // Accept new connections in a loop
    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(accept_connection(stream, ws_manager.clone()));
    }

    Ok(())
}

async fn accept_connection(stream: TcpStream, ws_manager: Arc<Mutex<WsManager>>) {
    let user_addr = stream
        .peer_addr()
        .expect("connected streams should have a peer address");

    let ws_stream = tokio_tungstenite::accept_async(stream)
        .await
        .expect("Error during the websocket handshake occurred");

    let (write, mut read) = ws_stream.split();

    // Add a user whenever someone connects
    let user = User::new(user_addr.to_string(), write);

    // Lock the manager just long enough to add the user - to reduce the time the lock is held
    {
        let mut manager = ws_manager.lock().await;
        manager.add_user(user);
    }

    println!("Connection established with addr: {}", user_addr);

    while let Some(msg_result) = read.next().await {
        match msg_result {
            Ok(msg) => {
                if msg.is_text() {
                    let msg_text = msg.to_text().unwrap(); // still unwrap here because you control msg type
                    if let Ok(data) = serde_json::from_str::<WsMessage>(msg_text) {
                        process_data(data, &user_addr.to_string(), ws_manager.clone()).await;
                    }
                } else if msg.is_close() {
                    println!("Closing Connection to user with addr: {}", user_addr);
                    let mut manager = ws_manager.lock().await;
                    manager.remove_user(&user_addr.to_string());
                    break;
                }
            }
            Err(e) => {
                match e {
                    WsError::Protocol(protocol_err) => {
                        println!(
                            "WebSocket protocol error from {}: {:?}",
                            user_addr, protocol_err
                        );
                    }
                    WsError::ConnectionClosed | WsError::AlreadyClosed => {
                        println!("WebSocket connection closed from {}: {:?}", user_addr, e);
                    }
                    _ => {
                        println!("WebSocket error from {}: {:?}", user_addr, e);
                    }
                }
                // Remove user and break the loop on error
                let mut manager = ws_manager.lock().await;
                manager.remove_user(&user_addr.to_string());
                break;
            }
        }
    }
}

async fn process_data(data: WsMessage, user_addr: &str, ws_manager: Arc<Mutex<WsManager>>) {
    let mut manager = ws_manager.lock().await;

    match data.method.as_str() {
        "SUBSCRIBE" => {
            manager.subscribe(user_addr, data).await;
        }
        "UNSUBSCRIBE" => {
            manager.unsubscribe(user_addr, data).await;
        }
        _ => {}
    }
}

async fn process_redis_message(ws_manager: Arc<Mutex<WsManager>>) {
    let mut message_stream;

    // Scope the lock to only the initialization of message_stream
    {
        let manager = ws_manager.lock().await;
        message_stream = manager.redis_connection.subscriber.message_rx();
    }

    println!("Listening for Redis Publisher messages");

    while let Ok(message) = message_stream.recv().await {
        let publisher_message = match message.value {
            RedisValue::String(s) => s.to_string(),
            _ => {
                println!("Unexpected Redis Publisher message value type");
                continue;
            }
        };

        // Lock the manager only when you need to send the message
        let mut manager = ws_manager.lock().await;
        manager.send_to_ws_stream(publisher_message).await;
    }
}
