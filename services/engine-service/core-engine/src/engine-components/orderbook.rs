use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use std::collections::BTreeMap;
use crates::types::orderbook::{
    Order,
    Fill,
    Asset,
    AssetPair,
    OrderSide,
    OrderStatus,
    OrderType,
    CreateOrder,  
    GetOpenOrders,
    CancelOrder,
    CancelAllOrder,
    ProcessedOrderResult,
};

pub struct Orderbook {
    pub asks: BTreeMap<Decimal, Vec<Order>>,
    pub bids: BTreeMap<Decimal, Vec<Order>>,
    pub asset_pair: AssetPair,
    pub trade_id: i64,
    last_update_id: i64
}

impl Orderbook {
    pub fn new(asset_pair: AssetPair, trade_id: i64) -> Orderbook {
        Orderbook {
            asks: BTreeMap::new(),
            bids: BTreeMap::new(),
            asset_pair,
            trade_id,
            last_update_id: 0
        }
    }

    pub fn ticker(&self) -> String {
        format!("{}_{}", self.asset_pair.base, self.asset_pair.quote)
    }

    pub fn process_order(&mut self, mut order: Order) -> ProcessedOrderResult {
        let order_result: ProcessedOrderResult;

        match order.order_side {
            OrderSide::BUY => {
                order_result = self.match_asks(&order);
                if order_result.executed_quantity < order.quantity {
                    order.filled_quantity = order_result.executed_quantity;
                    self.bids
                        .entry(order.price)
                        .and_modify(|orders| orders.push(order.clone()))
                        .or_insert(vec![order.clone()]);
                }
                order_result
            },
            OrderSide::SELL => {
                order_result = self.match_bids(&order);
                if order_result.executed_quantity < order.quantity {
                    order.filled_quantity = order_result.executed_quantity;
                    self.asks
                        .entry(order.price)
                        .and_modify(|orders| orders.push(order.clone()))
                        .or_insert(vec![order.clone()])
                }
                order_result
            }
        }
    }

    pub fn match_asks(&mut self, order: &Order) -> ProcessedOrderResult {
        let mut fills: Vec<Fill> = Vec::new();
        let mut executed_quantity: Decimal = dec!(0);
        let mut empty_prices = Vec::new();

        for (price, asks) in self.asks.iter_mut() {

            // stop if price of ask is more than order bid or order is filled
            if *price > order.price || executed_quantity == order.quantity {
                break;
            }

            let mut i = 0;
            while i < asks.len() && executed_quantity < order.quantity {
                let ask = &mut asks[i];
                let remaining = order.quantity - executed_quantity;
                let available = ask.quantity - ask.filled_quantity;

                let filled_quantity = std::cmp::min(remaining, available);

                if filled_quantity.is_zero() {
                    i += 1;
                    continue;
                }

                self.trade_id += 1;

                executed_quantity += filled_quantity;
                ask.filled_quantity += filled_quantity;

                fills.push(Fill {
                    price: ask.price,
                    quantity: filled_quantity,
                    trade_id: self.trade_id,
                    order_id: order.order_id.clone(), // taker
                    other_user_id: ask.user_id.clone() // maker
                });

                // O(n) TODO: make it faster
                if ask.filled_quantity == ask.quantity {
                    asks.remove(i);
                } else {
                    i += 1;
                }
            }

            if asks.is_empty() {
                empty_prices.push(*price);
            }

        }

        // remove asks which are empty
        for price in empty_prices {
            self.asks.remove(&price);
        }

        ProcessedOrderResult {
            executed_quantity,
            fills
        }
    }

    pub fn match_bids(&mut self, order: &Order) -> ProcessedOrderResult {
        let mut fills = Vec::new();
        let mut executed_quantity = dec!(0);
        let mut empty_prices = Vec::new();

        for (price, bids) in self.bids.iter_mut().rev() {

            // stop if bid is lower than order ask or order is filled
            if *price < order.price || executed_quantity == order.quantity {
                break;
            }

            let mut i = 0;
            while i < bids.len() && executed_quantity < order.quantity {
                let bid = &mut bids[i];
                let remaining = order.quantity - executed_quantity;
                let available = bid.quantity - bid.filled_quantity;

                let filled_quantity = std::cmp::min(remaining, available);
                self.trade_id += 1;

                if filled_quantity.is_zero() {
                    i += 1;
                    continue;
                }

                executed_quantity += filled_quantity;
                bid.filled_quantity += filled_quantity;

                fills.push(Fill {
                    price: bid.price,
                    quantity: filled_quantity,
                    trade_id: self.trade_id,
                    order_id: order.order_id.clone(), // taker
                    other_user_id: bid.user_id.clone() // maker
                });

                // O(n) TODO: make it faster
                if bid.filled_quantity == bid.quantity {
                    bids.remove(i);
                } else {
                    i += 1;
                }
            }

            if bids.is_empty() {
                empty_prices.push(*price);
            }
        }

        // remove bids which are empty
        for price in empty_prices {
            self.bids.remove(&price);
        }

        ProcessedOrderResult {
            executed_quantity,
            fills
        }
    }

    pub fn cancel_order(&mut self, cancel_order: &CancelOrder) -> Result<Order, ()> {
        let cancel = |orders_map: &mut BTreeMap<Decimal, Vec<Order>>| {
            if let Some(orders) = order_map.get_mut(&cancel_order.price) {
                if let Some(index) = orders.iter().position(|order| order.order_id == cancel_order.order_id) {
                    let removed_order = orders.remove(index);
                    ok(removed_order)
                } else {
                    Err(())
                }
            } else {
                Err(())
            }
        }

        match cancel_order.order_side {
            OrderSide::BUY => cancel(&mut self.bids),
            OrderSide::SELL => cancel(&mut self.asks)
        }
    }
}