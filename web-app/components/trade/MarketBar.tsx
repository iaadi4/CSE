"use client";

import { useEffect, useState } from "react";
import { Ticker } from "@/lib/types";
import { getTicker } from "@/lib/httpClient";
import { SignalingManager } from "@/lib/SignalingManager";

export const MarketBar = ({ market }: { market: string }) => {
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [lastTradeDirection, setLastTradeDirection] = useState<'buy' | 'sell' | null>(null);

  useEffect(() => {
    // Fetch initial ticker data
    getTicker(market)
      .then(setTicker)
      .catch((error) => {
        console.error("Failed to fetch ticker:", error);
        setTicker(null);
      });

    // Register callback for trade updates to track direction
    SignalingManager.getInstance().registerCallback(
      "trade",
      (trade: any) => {
        // isBuyerMaker: true means the buyer was the maker (market sell hit the buy order) -> price went down -> red
        // isBuyerMaker: false means the seller was the maker (market buy hit the sell order) -> price went up -> green
        setLastTradeDirection(trade.isBuyerMaker ? 'sell' : 'buy');
      },
      `TICKER-TRADE-${market}`
    );

    // Register WebSocket callback for real-time ticker updates
    SignalingManager.getInstance().registerCallback(
      "ticker",
      (data: Partial<Ticker>) => {
        setTicker((prevTicker) => {
          // Only update if we have previous ticker data
          if (!prevTicker) return null;
          
          return {
            firstPrice: data?.firstPrice ?? prevTicker.firstPrice,
            high: data?.high ?? prevTicker.high,
            lastPrice: data?.lastPrice ?? prevTicker.lastPrice,
            low: data?.low ?? prevTicker.low,
            priceChange: data?.priceChange ?? prevTicker.priceChange,
            priceChangePercent: data?.priceChangePercent ?? prevTicker.priceChangePercent,
            quoteVolume: data?.quoteVolume ?? prevTicker.quoteVolume,
            symbol: data?.symbol ?? prevTicker.symbol,
            trades: data?.trades ?? prevTicker.trades,
            volume: data?.volume ?? prevTicker.volume,
          };
        });
      },
      `TICKER-${market}`
    );

    // Subscribe to ticker and trade updates
    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`ticker.${market}`, `trade.${market}`],
    });

    return () => {
      // Cleanup: unsubscribe and deregister callbacks
      SignalingManager.getInstance().deRegisterCallback("ticker", `TICKER-${market}`);
      SignalingManager.getInstance().deRegisterCallback("trade", `TICKER-TRADE-${market}`);
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`ticker.${market}`, `trade.${market}`],
      });
    };
  }, [market]);

  const priceChange = ticker ? parseFloat(ticker.priceChangePercent) : 0;
  const isPositive = priceChange >= 0;
  
  // Determine last price color based on last trade direction
  const lastPriceColor = lastTradeDirection === 'buy' 
    ? 'text-brand-green' 
    : lastTradeDirection === 'sell' 
    ? 'text-red-500' 
    : isPositive ? 'text-brand-green' : 'text-red-500'; // fallback to 24h change

  // Show loading/no data state
  if (ticker === null) {
    return (
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/30 px-6 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-cabinet-bold text-white">
            {market.replace("_", " / ")}
          </h2>
        </div>
        <div className="text-sm text-zinc-500 font-cabinet-medium">
          No trading data available for this market
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/30 px-6 py-3">
      {/* Market name */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-cabinet-bold text-white">
          {market.replace("_", " / ")}
        </h2>
        <div className={`w-2 h-2 rounded-full ${isPositive ? "bg-brand-green" : "bg-red-500"}`} />
      </div>

      {/* Price info */}
      <div className="flex items-center gap-8">
        {/* Last Price */}
        <div className="flex flex-col">
          <p className="text-xs text-zinc-400 font-cabinet-medium">Last Price</p>
          <p
            className={`text-lg font-cabinet-bold transition-colors duration-300 ${lastPriceColor}`}
          >
            ${ticker?.lastPrice || "—"}
          </p>
        </div>

        {/* 24H Change */}
        <div className="flex flex-col">
          <p className="text-xs text-zinc-400 font-cabinet-medium">24H Change</p>
          <p
            className={`text-sm font-cabinet-medium ${
              isPositive ? "text-brand-green" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {ticker?.priceChangePercent || "0"}%
          </p>
        </div>

        {/* 24H High */}
        <div className="flex flex-col">
          <p className="text-xs text-zinc-400 font-cabinet-medium">24H High</p>
          <p className="text-sm font-cabinet-medium text-white">
            ${ticker?.high || "—"}
          </p>
        </div>

        {/* 24H Low */}
        <div className="flex flex-col">
          <p className="text-xs text-zinc-400 font-cabinet-medium">24H Low</p>
          <p className="text-sm font-cabinet-medium text-white">
            ${ticker?.low || "—"}
          </p>
        </div>

        {/* 24H Volume */}
        <div className="flex flex-col">
          <p className="text-xs text-zinc-400 font-cabinet-medium">24H Volume</p>
          <p className="text-sm font-cabinet-medium text-white">
            {ticker?.volume
              ? parseFloat(ticker.volume).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
};
