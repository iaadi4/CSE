"use client";

import { LuBitcoin } from "react-icons/lu";
import { FaEthereum } from "react-icons/fa";
import { SiSolana } from "react-icons/si";
import { IoIosArrowForward } from "react-icons/io";
import { useState } from "react";

interface CoinData {
  name: string;
  icon: React.ReactNode;
  change: string;
  marketCap: string;
  volume24h: string;
  price: string;
}

const COIN_DATA: CoinData[] = [
  {
    name: "Bitcoin",
    icon: <LuBitcoin />,
    change: "+12.00%",
    marketCap: "$3,560M",
    volume24h: "$65.20M",
    price: "$48,032.32",
  },
  {
    name: "Ethereum",
    icon: <FaEthereum />,
    change: "+12.00%",
    marketCap: "$3,560M",
    volume24h: "$65.20M",
    price: "$48,032.32",
  },
  {
    name: "USDT",
    icon: <img src="/images/icons/tether.png" alt="USDT" className="w-full h-full" />,
    change: "+12.00%",
    marketCap: "$3,560M",
    volume24h: "$65.20M",
    price: "$48,032.32",
  },
  {
    name: "Solana",
    icon: <SiSolana />,
    change: "+12.00%",
    marketCap: "$3,560M",
    volume24h: "$65.20M",
    price: "$48,032.32",
  },
];

const TIME_RANGES = ["24H", "7D", "30D", "YTD"];

export default function MarketSnapshot() {
  const [selectedRange, setSelectedRange] = useState("24H");

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header with title and time range filters */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-white text-2xl font-cabinet-bold">Market Snapshot</h2>
        <div className="flex gap-2 bg-zinc-800 rounded-full">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-5 h-fit py-2 cursor-pointer rounded-full text-xs font-cabinet-medium transition-colors ${
                selectedRange === range
                  ? "bg-linear-to-t from-zinc-700 to-transparent border border-zinc-500 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_0.5fr] gap-4 px-4 pb-3 border-b border-zinc-800">
        <div className="text-zinc-500 text-sm font-cabinet-medium">Coin</div>
        <div className="text-zinc-500 text-sm font-cabinet-medium">Change</div>
        <div className="text-zinc-500 text-sm font-cabinet-medium">Market Cap</div>
        <div className="text-zinc-500 text-sm font-cabinet-medium">24h Volume</div>
        <div className="text-zinc-500 text-sm font-cabinet-medium">Price</div>
        <div></div>
      </div>

      {/* Coin List */}
      <div className="flex-1 overflow-y-auto">
        {COIN_DATA.map((coin, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_0.5fr] gap-4 px-4 py-4 hover:bg-zinc-900/30 transition-colors cursor-pointer rounded-xl items-center"
          >
            {/* Coin Name with Icon */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xl bg-zinc-800">
                {coin.icon}
              </div>
              <span className="text-white font-cabinet-medium text-base">
                {coin.name}
              </span>
            </div>

            {/* Change */}
            <div className="text-brand-green font-cabinet-medium text-sm">
              {coin.change}
            </div>

            {/* Market Cap */}
            <div className="text-white font-cabinet-regular text-sm">
              {coin.marketCap}
            </div>

            {/* 24h Volume */}
            <div className="text-white font-cabinet-regular text-sm">
              {coin.volume24h}
            </div>

            {/* Price */}
            <div className="text-white font-cabinet-medium text-sm">
              {coin.price}
            </div>

            {/* Arrow */}
            <div className="flex justify-end">
              <IoIosArrowForward className="text-zinc-500 text-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
