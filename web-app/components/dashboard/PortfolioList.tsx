"use client";

import { LuBitcoin } from "react-icons/lu";
import { FaEthereum } from "react-icons/fa";
import { SiSolana, SiBnbchain } from "react-icons/si";

interface AssetData {
  symbol: string;
  name: string;
  amount: number;
  change: string;
  icon: React.ReactNode;
}

const DUMMY_ASSETS: AssetData[] = [
  {
    symbol: "USDT",
    name: "Tether",
    amount: 12456.87,
    change: "+0.01%",
    icon: <img src="/images/icons/tether.png" alt="USDT logo" />,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    amount: 2.3,
    change: "+0.03%",
    icon: <FaEthereum />,
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.15,
    change: "+0.10%",
    icon: <LuBitcoin />,
  },
  {
    symbol: "SOL",
    name: "Solana",
    amount: 45.2,
    change: "+0.02%",
    icon: <SiSolana />,
  },
  {
    symbol: "BNB",
    name: "BNB",
    amount: 8.5,
    change: "+0.04%",
    icon: <SiBnbchain />,
  },
];

export default function PortfolioList() {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-white text-2xl font-cabinet-bold">My Portfolio</h2>
        <button className="text-brand-green text-base font-cabinet-medium hover:underline cursor-pointer">
          View details
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-zinc-900 rounded-3xl flex flex-col justify-between p-10">
        {DUMMY_ASSETS.map((asset, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {asset.icon}
              </div>
              <div>
                <div className="text-white font-cabinet-medium text-lg">
                  {asset.symbol}
                </div>
                <div className="text-zinc-500 text-base font-cabinet-regular">
                  {asset.name}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white font-cabinet-medium text-base">
                {asset.amount.toLocaleString('en-US', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              </div>
              <div className="text-brand-green text-sm font-cabinet-regular">
                {asset.change}
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
