"use client";

import { useState, useEffect } from "react";
import { getDepth, getTrades, Trade } from "@/lib/exchange-api";
import { WsManager } from "@/lib/ws-manager";
import { useTrades } from "@/providers/TradesProvider";

interface OrderBookEntry {
  price: string;
  size: string;
  total: string;
}

export const OrderBook = ({ market }: { market: string }) => {
  const [activeTab, setActiveTab] = useState<"orderbook" | "trades">("orderbook");
  const {
    bids,
    setBids,
    asks,
    setAsks,
    trades: recentTrades,
    setTrades,
    setPrice,
    price,
  } = useTrades();

  useEffect(() => {
    // Register WebSocket callbacks
    WsManager.getInstance().registerCallback(
      "depth",
      (data: any) => {
        console.log("Depth update received:", data);

        setBids((originalBids) => {
          let bidsAfterUpdate = [...(originalBids || [])];

          for (let i = 0; i < bidsAfterUpdate.length; i++) {
            for (let j = 0; j < data.bids.length; j++) {
              if (bidsAfterUpdate[i][0] === data.bids[j][0]) {
                bidsAfterUpdate[i][1] = data.bids[j][1];
                if (Number(bidsAfterUpdate[i][1]) === 0) {
                  bidsAfterUpdate.splice(i, 1);
                }
                break;
              }
            }
          }

          for (let j = 0; j < data.bids.length; j++) {
            if (
              Number(data.bids[j][1]) !== 0 &&
              !bidsAfterUpdate.map((x) => x[0]).includes(data.bids[j][0])
            ) {
              bidsAfterUpdate.push(data.bids[j]);
            }
          }
          
          bidsAfterUpdate.sort((x, y) => (Number(y[0]) < Number(x[0]) ? -1 : 1));
          return bidsAfterUpdate.slice(-30);
        });

        setAsks((originalAsks) => {
          let asksAfterUpdate = [...(originalAsks || [])];

          for (let i = 0; i < asksAfterUpdate.length; i++) {
            for (let j = 0; j < data.asks.length; j++) {
              if (asksAfterUpdate[i][0] === data.asks[j][0]) {
                asksAfterUpdate[i][1] = data.asks[j][1];
                if (Number(asksAfterUpdate[i][1]) === 0) {
                  asksAfterUpdate.splice(i, 1);
                }
                break;
              }
            }
          }

          for (let j = 0; j < data.asks.length; j++) {
            if (
              Number(data.asks[j][1]) !== 0 &&
              !asksAfterUpdate.map((x) => x[0]).includes(data.asks[j][0])
            ) {
              asksAfterUpdate.push(data.asks[j]);
            }
          }
          
          // Sort asks: lowest price to highest
          asksAfterUpdate.sort((x, y) => (Number(x[0]) < Number(y[0]) ? -1 : 1));
          return asksAfterUpdate.slice(0, 30);
        });
      },
      `DEPTH-${market}`
    );

    WsManager.getInstance().registerCallback(
      "trade",
      (data: any) => {
        console.log("Trade update received:", data);

        const newTrade: Trade = {
          id: data.t || `${Date.now()}`,
          isBuyerMaker: data.m || false,
          price: data.p || "0",
          quantity: data.q || "0",
          quoteQuantity: data.q || "0",
          timestamp: data.T || Date.now(),
        };

        setPrice(data.p || "0");

        setTrades((oldTrades) => {
          const newTrades = [...oldTrades];
          newTrades.unshift(newTrade);
          if (newTrades.length > 50) {
            newTrades.pop();
          }
          return newTrades;
        });
      },
      `TRADE-${market}`
    );

    // Subscribe to market data
    WsManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`depth.${market}`],
    });

    WsManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`trade.${market}`],
    });

    // Fetch initial data
    getTrades(market).then((trades) => {
      const filteredTrades = trades.filter((trade) => parseFloat(trade.quantity) !== 0);
      setTrades(filteredTrades.slice(0, 50));
      if (filteredTrades.length > 0) {
        setPrice(filteredTrades[0].price);
      }
    });

    getDepth(market).then((depth) => {
      const bidsData = depth.bids || [];
      const asksData = depth.asks || [];

      const filteredBids = bidsData.filter((bid) => parseFloat(bid[1]) !== 0);
      const filteredAsks = asksData.filter((ask) => parseFloat(ask[1]) !== 0);

      setBids(filteredBids.slice(-30));
      setAsks(filteredAsks.slice(0, 30));
    });

    // Cleanup on unmount
    return () => {
      WsManager.getInstance().deRegisterCallback("depth", `DEPTH-${market}`);
      WsManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth.${market}`],
      });

      WsManager.getInstance().deRegisterCallback("trade", `TRADE-${market}`);
      WsManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`trade.${market}`],
      });
    };
  }, [market, setBids, setAsks, setTrades, setPrice]);

  useEffect(() => {
    // Simulate real-time trades for demo purposes
    const interval = setInterval(() => {
      const currentPrice = parseFloat(price) || 148.5;
      const newPrice = currentPrice + (Math.random() - 0.5) * 0.5;
      const newTrade: Trade = {
        id: `dummy_${Date.now()}`,
        isBuyerMaker: Math.random() > 0.5,
        price: newPrice.toFixed(2),
        quantity: (Math.random() * 5 + 0.1).toFixed(4),
        quoteQuantity: "0",
        timestamp: Date.now(),
      };

      // Don't update price in MarketBar, only add to trades list
      setTrades((oldTrades) => {
        const newTrades = [newTrade, ...oldTrades];
        return newTrades.slice(0, 50);
      });
    }, 2000); // New trade every 2 seconds

    return () => clearInterval(interval);
  }, [price, setTrades]);

  useEffect(() => {
    // Simulate order book updates for demo
    const interval = setInterval(() => {
      const basePrice = parseFloat(price) || 148.5;
      
      // Update a random bid or ask
      if (Math.random() > 0.5 && bids.length > 0) {
        setBids((prevBids) => {
          const newBids = [...prevBids];
          const randomIndex = Math.floor(Math.random() * Math.min(5, newBids.length));
          const [priceStr] = newBids[randomIndex];
          const newSize = (Math.random() * 10 + 1).toFixed(4);
          newBids[randomIndex] = [priceStr, newSize];
          // Keep sorted: highest to lowest
          newBids.sort((x, y) => (Number(y[0]) < Number(x[0]) ? -1 : 1));
          return newBids;
        });
      } else if (asks.length > 0) {
        setAsks((prevAsks) => {
          const newAsks = [...prevAsks];
          const randomIndex = Math.floor(Math.random() * Math.min(5, newAsks.length));
          const [priceStr] = newAsks[randomIndex];
          const newSize = (Math.random() * 10 + 1).toFixed(4);
          newAsks[randomIndex] = [priceStr, newSize];
          // Keep sorted: lowest to highest
          newAsks.sort((x, y) => (Number(x[0]) < Number(y[0]) ? -1 : 1));
          return newAsks;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [price, bids, asks, setBids, setAsks]);

  // Calculate totals for order book
  const calculateTotal = (orders: [string, string][], index: number): string => {
    let total = 0;
    for (let i = 0; i <= index; i++) {
      total += parseFloat(orders[i][0]) * parseFloat(orders[i][1]);
    }
    return total.toFixed(2);
  };

  return (
    <div className="h-[600px] bg-[#121212] border-[#262626] rounded-xl border overflow-hidden flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-[#262626]">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "orderbook"
              ? "text-[#d4d4d8] border-b-2 border-[#34cb88]"
              : "text-[#a3a3a3]"
          }`}
          onClick={() => setActiveTab("orderbook")}
        >
          Order Book
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "trades"
              ? "text-[#d4d4d8] border-b-2 border-[#34cb88]"
              : "text-[#a3a3a3]"
          }`}
          onClick={() => setActiveTab("trades")}
        >
          Recent Trades
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "orderbook" ? (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="grid grid-cols-3 px-3 py-2 text-xs text-[#a3a3a3] border-b border-[#262626]">
              <div className="text-left">Price(USD)</div>
              <div className="text-right">Size(SOL)</div>
              <div className="text-right">Total</div>
            </div>

            {/* Asks (Sell Orders) - Display in reverse order (highest to lowest) */}
            <div className="flex-1 overflow-y-auto flex flex-col-reverse">
              {asks.slice(0, 12).map((ask, i) => (
                <div
                  key={`ask-${i}`}
                  className="grid grid-cols-3 px-3 py-1 text-xs hover:bg-[#262626] cursor-pointer"
                >
                  <div className="text-left text-[#ff615c]">{parseFloat(ask[0]).toFixed(2)}</div>
                  <div className="text-right text-[#d4d4d8]">{parseFloat(ask[1]).toFixed(4)}</div>
                  <div className="text-right text-[#a3a3a3]">{calculateTotal(asks, i)}</div>
                </div>
              ))}
            </div>

            {/* Current Price */}
            <div className="px-3 py-2 bg-[#262626] text-center">
              <div className="text-[#34cb88] text-lg font-semibold">
                $148.50
              </div>
              <div className="text-[#a3a3a3] text-xs">Current Price</div>
            </div>

            {/* Bids (Buy Orders) */}
            <div className="flex-1 overflow-y-auto">
              {bids.slice(0, 12).map((bid, i) => (
                <div
                  key={`bid-${i}`}
                  className="grid grid-cols-3 px-3 py-1 text-xs hover:bg-[#262626] cursor-pointer"
                >
                  <div className="text-left text-[#34cb88]">{parseFloat(bid[0]).toFixed(2)}</div>
                  <div className="text-right text-[#d4d4d8]">{parseFloat(bid[1]).toFixed(4)}</div>
                  <div className="text-right text-[#a3a3a3]">{calculateTotal(bids, i)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="grid grid-cols-3 px-3 py-2 text-xs text-[#a3a3a3] border-b border-[#262626]">
              <div className="text-left">Price(USD)</div>
              <div className="text-right">Size(SOL)</div>
              <div className="text-right">Time</div>
            </div>

            {/* Recent Trades */}
            <div className="flex-1 overflow-y-auto">
              {recentTrades.map((trade, i) => (
                <div
                  key={`trade-${i}`}
                  className="grid grid-cols-3 px-3 py-1 text-xs hover:bg-[#262626] cursor-pointer"
                >
                  <div
                    className={`text-left ${
                      !trade.isBuyerMaker ? "text-[#34cb88]" : "text-[#ff615c]"
                    }`}
                  >
                    {parseFloat(trade.price).toFixed(2)}
                  </div>
                  <div className="text-right text-[#d4d4d8]">{parseFloat(trade.quantity).toFixed(4)}</div>
                  <div className="text-right text-[#a3a3a3]">{new Date(trade.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
