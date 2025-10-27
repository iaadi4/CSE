"use client";

import { useMemo, useState } from "react";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { FaSearch } from "react-icons/fa";
import Sparkline from "@/components/market/Sparkline";
import { Ticker } from "@/lib/types";
import Link from "next/link";

interface MarketListProps {
  initialTickers: Ticker[];
}

export default function MarketList({ initialTickers }: MarketListProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"symbol" | "price" | "change" | "volume">("symbol");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Generate dummy sparkline data for each ticker
  const tickersWithSparkline = useMemo(() => {
    return initialTickers.map((ticker) => ({
      ...ticker,
      sparkline: Array.from({ length: 20 }, (_, i) => {
        const basePrice = parseFloat(ticker.lastPrice);
        const variance = basePrice * 0.02;
        return basePrice + Math.sin(i / 2) * variance + (Math.random() - 0.5) * variance;
      }),
    }));
  }, [initialTickers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = tickersWithSparkline.slice();
    
    if (q) {
      arr = arr.filter(
        (m) =>
          m.symbol.toLowerCase().includes(q) ||
          m.symbol.replace("_", "").toLowerCase().includes(q)
      );
    }

    arr.sort((a, b) => {
      let v = 0;
      switch (sortKey) {
        case "symbol":
          v = a.symbol.localeCompare(b.symbol);
          break;
        case "price":
          v = parseFloat(a.lastPrice) - parseFloat(b.lastPrice);
          break;
        case "change":
          v = parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent);
          break;
        case "volume":
          v = parseFloat(a.volume) - parseFloat(b.volume);
          break;
      }
      return sortDir === "asc" ? v : -v;
    });

    return arr;
  }, [tickersWithSparkline, query, sortKey, sortDir]);

  const toggleSort = (key: "symbol" | "price" | "change" | "volume") => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const formatSymbol = (symbol: string) => {
    return symbol.replace("_", " / ");
  };

  const getSymbolParts = (symbol: string) => {
    const parts = symbol.split("_");
    return { base: parts[0], quote: parts[1] };
  };

  const getIcon = (symbol: string) => {
    if (symbol === "BTC") return <SiBitcoin className="text-orange-400" />;
    if (symbol === "ETH") return <SiEthereum className="text-blue-400" />;
    if (symbol === "SOL") return <div className="text-purple-400">◎</div>;
    return <div className="text-zinc-400">{symbol[0]}</div>;
  };

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-zinc-800/50 rounded-xl px-3 py-2 text-zinc-400">
            <FaSearch />
          </div>
          <input
            className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-2 text-white focus:outline-none font-cabinet-medium"
            placeholder="Search markets (e.g., BTC, ETH, SOL)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSort("symbol")}
            className="px-3 py-2 rounded-xl bg-zinc-800/50 text-zinc-300 text-sm font-cabinet-medium hover:bg-zinc-800 transition-colors"
          >
            Symbol {sortKey === "symbol" && (sortDir === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => toggleSort("price")}
            className="px-3 py-2 rounded-xl bg-zinc-800/50 text-zinc-300 text-sm font-cabinet-medium hover:bg-zinc-800 transition-colors"
          >
            Price {sortKey === "price" && (sortDir === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => toggleSort("change")}
            className="px-3 py-2 rounded-xl bg-zinc-800/50 text-zinc-300 text-sm font-cabinet-medium hover:bg-zinc-800 transition-colors"
          >
            24h {sortKey === "change" && (sortDir === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => toggleSort("volume")}
            className="px-3 py-2 rounded-xl bg-zinc-800/50 text-zinc-300 text-sm font-cabinet-medium hover:bg-zinc-800 transition-colors"
          >
            Volume {sortKey === "volume" && (sortDir === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-zinc-400 text-xs font-cabinet-medium border-b border-zinc-800">
              <th className="py-3 px-4 text-left">Market</th>
              <th className="py-3 px-4 text-right">Price</th>
              <th className="py-3 px-4 text-right">24h Change</th>
              <th className="py-3 px-4 text-right">24h High</th>
              <th className="py-3 px-4 text-right">24h Low</th>
              <th className="py-3 px-4 text-right">Volume</th>
              <th className="py-3 px-4 text-center">Chart</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticker) => {
              const { base, quote } = getSymbolParts(ticker.symbol);
              const change = parseFloat(ticker.priceChangePercent);
              const isPositive = change >= 0;

              return (
                <tr
                  key={ticker.symbol}
                  className="border-b border-zinc-800/30 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <Link href={`/trade/${ticker.symbol}`}>
                      <div className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                        <div className="w-8 h-8 bg-zinc-800/30 rounded-full flex items-center justify-center text-xl">
                          {getIcon(base)}
                        </div>
                        <div>
                          <div className="text-white font-cabinet-medium text-sm">
                            {formatSymbol(ticker.symbol)}
                          </div>
                          <div className="text-zinc-400 text-xs">{base}/{quote}</div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-right text-white text-sm font-cabinet-medium">
                    ${parseFloat(ticker.lastPrice).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </td>
                  <td
                    className={`py-4 px-4 text-right text-sm font-cabinet-medium ${
                      isPositive ? "text-brand-green" : "text-red-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {change.toFixed(2)}%
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-zinc-300 font-cabinet-medium">
                    ${parseFloat(ticker.high).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-zinc-300 font-cabinet-medium">
                    ${parseFloat(ticker.low).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-zinc-300 font-cabinet-medium">
                    {parseFloat(ticker.volume).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Sparkline
                      data={ticker.sparkline}
                      color={isPositive ? "#34cb88" : "#ff6b6b"}
                      width={140}
                      height={40}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-400 font-cabinet-medium">
            No markets found
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 text-zinc-400 text-sm font-cabinet-medium">
          Showing {filtered.length} market{filtered.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
