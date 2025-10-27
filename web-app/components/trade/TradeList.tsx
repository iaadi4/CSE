"use client";

import { useEffect, useState } from "react";
import { Trade } from "@/lib/types";
import { getTrades } from "@/lib/httpClient";
import { SignalingManager } from "@/lib/SignalingManager";

interface TradeListProps {
  market: string;
}

export function TradeList({ market }: TradeListProps) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // Fetch initial trades
    getTrades(market)
      .then((t) => setTrades(t.slice(0, 50)))
      .catch(console.error);

    // Register WebSocket callback for real-time trade updates
    SignalingManager.getInstance().registerCallback(
      "trade",
      (newTrade: Trade) => {
        setTrades((prev) => [newTrade, ...prev].slice(0, 50));
      },
      `TRADES-${market}`
    );

    // Subscribe to trade updates
    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`trade.${market}`],
    });

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`trade.${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback("trade", `TRADES-${market}`);
    };
  }, [market]);

  return (
    <div className="flex flex-col h-full bg-zinc-900/30">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-cabinet-bold text-white">Recent Trades</h3>
      </div>

      {/* Header */}
      <div className="flex justify-between px-4 py-2 text-xs text-zinc-400 font-cabinet-medium border-b border-zinc-800/50">
        <div className="flex-1 text-left">Price</div>
        <div className="flex-1 text-right">Quantity</div>
        <div className="flex-1 text-right">Time</div>
      </div>

      {/* Trades list */}
      <div className="flex-1 overflow-y-auto">
        {trades.map((trade, index) => {
          const time = new Date(trade.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          });

          return (
            <div
              key={`${trade.id}-${index}`}
              className="flex justify-between px-4 py-1 text-xs font-cabinet-medium hover:bg-zinc-800/30"
            >
              <div
                className={`flex-1 text-left ${
                  trade.isBuyerMaker ? "text-red-400" : "text-brand-green"
                }`}
              >
                {parseFloat(trade.price).toFixed(2)}
              </div>
              <div className="flex-1 text-right text-zinc-300">
                {parseFloat(trade.quantity).toFixed(4)}
              </div>
              <div className="flex-1 text-right text-zinc-400">{time}</div>
            </div>
          );
        })}

        {trades.length === 0 && (
          <div className="flex items-center justify-center h-full text-zinc-500 text-xs font-cabinet-medium">
            No trades yet
          </div>
        )}
      </div>
    </div>
  );
}
