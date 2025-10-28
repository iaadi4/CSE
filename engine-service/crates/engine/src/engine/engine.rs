use crate::engine::db::DbUpdates;
use crate::engine::orderbook::OrderBook;
use crate::engine::ws_stream::WsStreamUpdates;
use crate::types::engine::{
    Asset, AssetPair, CancelAllOrders, CancelOrder, CreateOrder, GetDepth, GetOpenOrder,
    GetOpenOrders, Order, OrderSide, OrderStatus, OrderType, ProcessOrderResult,
};
use db_processor::query::get_latest_trade_id_from_db;
use redis::RedisManager;
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Postgres};
use std::collections::HashMap;
use std::sync::Mutex;

pub enum AmountType {
    AVAILABLE,
    LOCKED,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Amount {
    available: Decimal,
    locked: Decimal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserBalances {
    user_id: String,
    balance: HashMap<Asset, Amount>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Engine {
    pub orderbooks: Vec<OrderBook>,
    pub balances: HashMap<String, Mutex<UserBalances>>,
}

impl Engine {
    pub fn new() -> Engine {
        Engine {
            orderbooks: vec![],
            balances: HashMap::new(),
        }
    }

    pub async fn init_engine(&mut self, pool: &Pool<Postgres>) {
        let market = "SOL_USDC".to_string();
        let trade_id: i64 = get_latest_trade_id_from_db(pool, market).await.unwrap();

        let orderbook = OrderBook::new(
            AssetPair {
                base: Asset::SOL,
                quote: Asset::USDC,
            },
            trade_id + 1,
        );

        self.orderbooks.push(orderbook);
    }

    pub fn init_user_balance(&mut self, user_id: &str) {
        let initial_balances = UserBalances {
            user_id: user_id.to_string(),
            balance: HashMap::new(),
        };

        // Add dummy values for USDC and SOL
        let usdc_balance = Amount {
            available: Decimal::new(1000000, 0), // Dummy value: 1000000 USDC
            locked: Decimal::new(0, 0),          // 0 locked
        };

        let sol_balance = Amount {
            available: Decimal::new(10000, 0), // Dummy value: 10000 SOL
            locked: Decimal::new(0, 0),        // 0 locked
        };

        // Initialize the balance HashMap for the user
        let mut balances_map = initial_balances.balance;
        balances_map.insert(Asset::USDC, usdc_balance);
        balances_map.insert(Asset::SOL, sol_balance);

        // Add the initialized UserBalances to the Engine's balances map
        self.balances.insert(
            user_id.to_string(),
            Mutex::new(UserBalances {
                user_id: user_id.to_string(),
                balance: balances_map,
            }),
        );
    }

    pub async fn create_order(
        &mut self,
        input_order: CreateOrder,
        redis_conn: &RedisManager,
    ) -> Result<String, &str> {
        let funds_check = self.check_and_lock_funds(&input_order);

        if funds_check.is_err() {
            return Err("Funds check failed");
        }

        let orderbook = match self
            .orderbooks
            .iter_mut()
            .find(|orderbook| orderbook.ticker() == input_order.market)
        {
            Some(ob) => ob,
            None => {
                eprintln!(
                    "No matching orderbook found for market: {}",
                    input_order.market
                );
                return Err("No matching orderbook found");
            }
        };

        let assets: Vec<&str> = input_order.market.split('_').collect();
        let base_asset = Asset::from_str(assets[0]).unwrap();
        let quote_asset = Asset::from_str(assets[1]).unwrap();
        let order_id = uuid::Uuid::new_v4().to_string();

        let order = Order {
            price: input_order.price,
            quantity: input_order.quantity,
            filled_quantity: dec!(0),
            order_id: order_id.clone(),
            user_id: input_order.user_id.clone(),
            side: input_order.side,
            order_type: OrderType::MARKET,
            order_status: OrderStatus::Pending,
            timestamp: chrono::Utc::now().timestamp_millis(),
        };

        let order_result: ProcessOrderResult = orderbook.process_order(order.clone());
        println!("Current orderbook bids {:?}", orderbook.bids);
        println!("Current orderbook asks {:?}", orderbook.asks);

        let _ = self.update_user_balance(base_asset, quote_asset, order.clone(), &order_result);
        let _ = self
            .update_db_orders(
                order.clone(),
                order_result.executed_quantity,
                &order_result.fills,
                redis_conn,
            )
            .await;

        let _ = self
            .create_db_trades(
                input_order.user_id.clone(),
                input_order.market.clone(),
                &order_result.fills,
                redis_conn,
            )
            .await;

        let _ = self
            .publish_ws_trades(
                input_order.market.clone(),
                input_order.user_id.clone(),
                &order_result.fills,
                order.timestamp,
                redis_conn,
            )
            .await;

        let _ = self
            .publish_ws_depth_updates(
                input_order.market.clone(),
                order.price,
                order.side,
                &order_result.fills,
                redis_conn,
            )
            .await;

        Ok(order_id)
    }

    pub fn get_open_order(&mut self, open_order: GetOpenOrder) -> Result<&Order, ()> {
        let orderbook = match self
            .orderbooks
            .iter_mut()
            .find(|orderbook| orderbook.ticker() == open_order.market)
        {
            Some(ob) => ob,
            None => {
                eprintln!(
                    "No matching orderbook found for market: {}",
                    open_order.market
                );
                return Err(());
            }
        };

        let open_order = orderbook.get_open_order(open_order.user_id, open_order.order_id);

        open_order
    }

    pub fn cancel_order(&mut self, cancel_order: CancelOrder) -> Result<String, &str> {
        let orderbook = match self
            .orderbooks
            .iter_mut()
            .find(|orderbook| orderbook.ticker() == cancel_order.market)
        {
            Some(ob) => ob,
            None => {
                eprintln!(
                    "No matching orderbook found for market: {}",
                    cancel_order.market
                );
                return Err("No matching orderbook found");
            }
        };

        let assets: Vec<&str> = cancel_order.market.split('_').collect();
        let base_asset_str = assets[0];
        let quote_asset_str = assets[1];
        let base_asset = Asset::from_str(base_asset_str)?;
        let quote_asset = Asset::from_str(quote_asset_str)?;
        let cancel_order_id = cancel_order.order_id.clone();

        let result = orderbook.cancel_order(cancel_order);

        match result {
            Ok(order) => {
                let quantity = match order.side {
                    OrderSide::BUY => (order.quantity - order.filled_quantity) * order.price,
                    OrderSide::SELL => order.quantity - order.filled_quantity,
                };

                match order.side {
                    OrderSide::BUY => {
                        self.update_balance_with_lock(
                            order.user_id.clone(),
                            quote_asset.clone(),
                            quantity,
                            AmountType::AVAILABLE,
                        )?;

                        self.update_balance_with_lock(
                            order.user_id.clone(),
                            quote_asset.clone(),
                            -quantity,
                            AmountType::LOCKED,
                        )?;
                    }

                    OrderSide::SELL => {
                        self.update_balance_with_lock(
                            order.user_id.clone(),
                            base_asset.clone(),
                            quantity,
                            AmountType::AVAILABLE,
                        )?;

                        self.update_balance_with_lock(
                            order.user_id.clone(),
                            base_asset.clone(),
                            -quantity,
                            AmountType::LOCKED,
                        )?;
                    }
                }

                return Ok(cancel_order_id);
            }

            Err(()) => {
                println!("Failed to cancel order");
                return Err("Failed to cancel order");
            }
        }
    }

    pub fn get_open_orders(&mut self, open_orders: GetOpenOrders) -> Vec<&Order> {
        let orderbook = match self
            .orderbooks
            .iter_mut()
            .find(|orderbook| orderbook.ticker() == open_orders.market)
        {
            Some(ob) => ob,
            None => {
                eprintln!(
                    "No matching orderbook found for market: {}",
                    open_orders.market
                );
                return Vec::new();
            }
        };

        let open_orders: Vec<&Order> = orderbook.get_open_orders(open_orders.user_id);

        open_orders
    }

    pub fn cancel_all_orders(
        &mut self,
        cancel_all_orders: CancelAllOrders,
    ) -> Result<String, &str> {
        let orderbook = match self
            .orderbooks
            .iter_mut()
            .find(|orderbook| orderbook.ticker() == cancel_all_orders.market)
        {
            Some(ob) => ob,
            None => {
                eprintln!(
                    "No matching orderbook found for market: {}",
                    cancel_all_orders.market
                );
                return Err("No matching orderbook found");
            }
        };

        let assets: Vec<&str> = cancel_all_orders.market.split('_').collect();
        let base_asset_str = assets[0];
        let quote_asset_str = assets[1];
        let base_asset = Asset::from_str(base_asset_str)?;
        let quote_asset = Asset::from_str(quote_asset_str)?;

        let open_orders = orderbook.cancel_all_orders(cancel_all_orders.user_id.clone());

        let mut balance_updates: Vec<(String, Asset, Decimal, AmountType)> = Vec::new();

        for order in open_orders {
            let quantity = match order.side {
                OrderSide::BUY => (order.quantity - order.filled_quantity) * order.price,
                OrderSide::SELL => order.quantity - order.filled_quantity,
            };

            match order.side {
                OrderSide::BUY => {
                    balance_updates.push((
                        order.user_id.clone(),
                        quote_asset.clone(),
                        quantity,
                        AmountType::AVAILABLE,
                    ));
                    balance_updates.push((
                        order.user_id.clone(),
                        quote_asset.clone(),
                        -quantity,
                        AmountType::LOCKED,
                    ));
                }

                OrderSide::SELL => {
                    balance_updates.push((
                        order.user_id.clone(),
                        base_asset.clone(),
                        quantity,
                        AmountType::AVAILABLE,
                    ));
                    balance_updates.push((
                        order.user_id.clone(),
                        base_asset.clone(),
                        -quantity,
                        AmountType::LOCKED,
                    ));
                }
            }
        }

        // Perform balance updates after the loop, ensuring only one mutable borrow of `self`
        for (user_id, asset, amount, amount_type) in balance_updates {
            self.update_balance_with_lock(user_id, asset, amount, amount_type)?;
        }

        // Return a success message after cancelling all orders
        Ok(format!(
            "All orders for user {} cancelled successfully",
            cancel_all_orders.user_id
        ))
    }

    pub fn get_depth(&self, depth: GetDepth) -> (Vec<(Decimal, Decimal)>, Vec<(Decimal, Decimal)>) {
        let orderbook = match self
            .orderbooks
            .iter()
            .find(|orderbook| orderbook.ticker() == depth.symbol)
        {
            Some(ob) => ob,
            None => {
                eprintln!("No matching orderbook found for market: {}", depth.symbol);
                return (Vec::new(), Vec::new());
            }
        };

        let depth = orderbook.get_depth();

        depth
    }

    pub fn check_and_lock_funds(&mut self, order: &CreateOrder) -> Result<(), &str> {
        let assets: Vec<&str> = order.market.split('_').collect();
        let base_asset_str = assets[0];
        let quote_asset_str = assets[1];

        // Convert string assets to Asset enum
        let base_asset = Asset::from_str(base_asset_str)?;
        let quote_asset = Asset::from_str(quote_asset_str)?;

        let user_id = &order.user_id;

        let user_balance_mutex = self
            .balances
            .get_mut(user_id)
            .ok_or("No matching user found")?;

        // Lock the Mutex to safely access the user's balances
        let mut user_balance = user_balance_mutex.lock().map_err(|_| "Mutex lock failed")?;

        match order.side {
            OrderSide::BUY => {
                let balance = user_balance
                    .balance
                    .get_mut(&quote_asset)
                    .ok_or("No balance for asset found")?;

                let total_cost = order.price * order.quantity;
                if balance.available >= total_cost {
                    balance.available -= total_cost;
                    balance.locked += total_cost;
                } else {
                    return Err("Insufficient funds");
                }
            }

            OrderSide::SELL => {
                // User must have order.quantity of base_asset
                let balance = user_balance
                    .balance
                    .get_mut(&base_asset)
                    .ok_or("No balance for asset found")?;

                if balance.available >= order.quantity {
                    balance.available -= order.quantity;
                    balance.locked += order.quantity;
                } else {
                    return Err("Insufficient asset quantity");
                }
            }
        }

        Ok(())
    }

    pub fn update_user_balance(
        &mut self,
        base_asset: Asset,
        quote_asset: Asset,
        order: Order,
        order_result: &ProcessOrderResult,
    ) -> Result<(), &str> {
        match order.side {
            OrderSide::BUY => {
                for fill in &order_result.fills {
                    // Update buyer's balances (current user)
                    self.update_balance_with_lock(
                        order.user_id.clone(),
                        base_asset.clone(),
                        fill.quantity,
                        AmountType::AVAILABLE,
                    )?;
                    self.update_balance_with_lock(
                        order.user_id.clone(),
                        quote_asset.clone(),
                        -(fill.price * fill.quantity),
                        AmountType::LOCKED,
                    )?;

                    // Update seller's balances (other user)
                    self.update_balance_with_lock(
                        fill.other_user_id.clone(),
                        quote_asset.clone(),
                        fill.price * fill.quantity,
                        AmountType::AVAILABLE,
                    )?;
                    self.update_balance_with_lock(
                        fill.other_user_id.clone(),
                        base_asset.clone(),
                        -fill.quantity,
                        AmountType::LOCKED,
                    )?;
                }
            }
            OrderSide::SELL => {
                for fill in &order_result.fills {
                    // Update seller's balances (current user)
                    self.update_balance_with_lock(
                        order.user_id.clone(),
                        base_asset.clone(),
                        -fill.quantity,
                        AmountType::LOCKED,
                    )?;
                    self.update_balance_with_lock(
                        order.user_id.clone(),
                        quote_asset.clone(),
                        fill.price * fill.quantity,
                        AmountType::AVAILABLE,
                    )?;

                    // Update buyer's balances (other user)
                    self.update_balance_with_lock(
                        fill.other_user_id.clone(),
                        base_asset.clone(),
                        fill.quantity,
                        AmountType::AVAILABLE,
                    )?;
                    self.update_balance_with_lock(
                        fill.other_user_id.clone(),
                        quote_asset.clone(),
                        -(fill.price * fill.quantity),
                        AmountType::LOCKED,
                    )?;
                }
            }
        }
        Ok(())
    }

    // Helper function to update balance with lock
    fn update_balance_with_lock(
        &self,
        user_id: String,
        asset: Asset,
        amount: Decimal,
        amount_type: AmountType,
    ) -> Result<(), &str> {
        // Access the user's balance via the Mutex
        let balances = &self.balances;
        let user_balance_mutex = balances.get(&user_id).ok_or("No matching user found")?;

        // Lock the Mutex to safely access the user's balances
        let mut user_balance = user_balance_mutex.lock().map_err(|_| "Mutex lock failed")?;

        let balance = user_balance
            .balance
            .get_mut(&asset)
            .ok_or("No balance for asset found")?;

        match amount_type {
            AmountType::AVAILABLE => balance.available += amount,
            AmountType::LOCKED => balance.locked += amount,
        }

        Ok(())
    }
}
