"use client";

import { createContext, useContext, useState, useRef, ReactNode } from "react";
import { Trade, Ticker } from "@/lib/exchange-api";

interface TradeContextType {
  ticker: Ticker | null;
  setTicker: (ticker: Ticker | null) => void;
  stats: { label: string; value: string }[];
  setStats: (stats: { label: string; value: string }[]) => void;
  price: string;
  setPrice: (price: string) => void;
  trades: Trade[];
  setTrades: (trades: Trade[] | ((prev: Trade[]) => Trade[])) => void;
  bids: [string, string][];
  setBids: (bids: [string, string][] | ((prev: [string, string][]) => [string, string][])) => void;
  asks: [string, string][];
  setAsks: (asks: [string, string][] | ((prev: [string, string][]) => [string, string][])) => void;
  totalBidSize: number;
  setTotalBidSize: (size: number) => void;
  totalAskSize: number;
  setTotalAskSize: (size: number) => void;
  orderBookRef: React.RefObject<HTMLDivElement | null>;
}

const TradesContext = createContext<TradeContextType | undefined>(undefined);

export function TradesProvider({ children }: { children: ReactNode }) {
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [stats, setStats] = useState<{ label: string; value: string }[]>([]);
  const [price, setPrice] = useState("148.50");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [bids, setBids] = useState<[string, string][]>([]);
  const [asks, setAsks] = useState<[string, string][]>([]);
  const [totalBidSize, setTotalBidSize] = useState(0);
  const [totalAskSize, setTotalAskSize] = useState(0);
  const orderBookRef = useRef<HTMLDivElement>(null);

  return (
    <TradesContext.Provider
      value={{
        ticker,
        setTicker,
        stats,
        setStats,
        price,
        setPrice,
        trades,
        setTrades,
        bids,
        setBids,
        asks,
        setAsks,
        totalBidSize,
        setTotalBidSize,
        totalAskSize,
        setTotalAskSize,
        orderBookRef,
      }}
    >
      {children}
    </TradesContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradesContext);
  if (context === undefined) {
    throw new Error("useTrades must be used within a TradesProvider");
  }
  return context;
}
