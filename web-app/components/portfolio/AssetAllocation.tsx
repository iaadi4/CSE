"use client";

import { LuBitcoin } from "react-icons/lu";
import { FaEthereum } from "react-icons/fa";
import { SiSolana } from "react-icons/si";

interface AssetHolding {
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercentage: number;
  icon: React.ReactNode;
}

const HOLDINGS: AssetHolding[] = [
  {
    symbol: "USDT",
    name: "Tether",
    amount: 12456.87,
    avgBuyPrice: 1.00,
    currentPrice: 1.00,
    value: 12456.87,
    pnl: 0,
    pnlPercentage: 0,
    icon: <img src="/images/icons/tether.png" alt="USDT" className="w-full h-full" />,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    amount: 2.3,
    avgBuyPrice: 2180.50,
    currentPrice: 2275.45,
    value: 5233.54,
    pnl: 218.39,
    pnlPercentage: 4.35,
    icon: <FaEthereum />,
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.15,
    avgBuyPrice: 45200.00,
    currentPrice: 48032.32,
    value: 7204.85,
    pnl: 424.85,
    pnlPercentage: 6.27,
    icon: <LuBitcoin />,
  },
  {
    symbol: "SOL",
    name: "Solana",
    amount: 45.2,
    avgBuyPrice: 42.30,
    currentPrice: 45.01,
    value: 2034.45,
    pnl: 122.49,
    pnlPercentage: 6.40,
    icon: <SiSolana />,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    amount: 5000.00,
    avgBuyPrice: 1.00,
    currentPrice: 1.00,
    value: 5000.00,
    pnl: 0,
    pnlPercentage: 0,
    icon: <img src="/images/icons/usdc.png" alt="USDC" className="w-full h-full" />,
  },
];

export default function AssetAllocation() {
  const totalValue = HOLDINGS.reduce((sum, holding) => sum + holding.value, 0);
  const totalPnl = HOLDINGS.reduce((sum, holding) => sum + holding.pnl, 0);

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-white text-lg font-cabinet-bold">Asset Allocation</h2>
        <div className="text-right">
          <div className="text-zinc-400 text-xs font-cabinet-regular">Total P&L</div>
          <div className={`text-sm font-cabinet-bold ${
            totalPnl >= 0 ? "text-brand-green" : "text-red-500"
          }`}>
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-3 pb-2 border-b border-zinc-800 mb-2">
        <div className="text-zinc-500 text-xs font-cabinet-medium">Asset</div>
        <div className="text-zinc-500 text-xs font-cabinet-medium text-right">Amount</div>
        <div className="text-zinc-500 text-xs font-cabinet-medium text-right">Value</div>
        <div className="text-zinc-500 text-xs font-cabinet-medium text-right">Avg Buy</div>
        <div className="text-zinc-500 text-xs font-cabinet-medium text-right">P&L</div>
      </div>

      {/* Holdings List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {HOLDINGS.map((holding, index) => {
          const allocation = (holding.value / totalValue) * 100;
          
          return (
            <div
              key={index}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-3 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:bg-zinc-900/70 transition-colors items-center"
            >
              {/* Asset */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-base bg-zinc-800">
                  {holding.icon}
                </div>
                <div>
                  <div className="text-white font-cabinet-medium text-xs">
                    {holding.symbol}
                  </div>
                  <div className="text-zinc-500 text-[10px] font-cabinet-regular">
                    {allocation.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <div className="text-white font-cabinet-medium text-xs">
                  {holding.amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </div>
              </div>

              {/* Value */}
              <div className="text-right">
                <div className="text-white font-cabinet-medium text-xs">
                  ${holding.value.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-zinc-500 text-[10px] font-cabinet-regular">
                  @${holding.currentPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>

              {/* Avg Buy */}
              <div className="text-right">
                <div className="text-white font-cabinet-regular text-xs">
                  ${holding.avgBuyPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>

              {/* P&L */}
              <div className="text-right">
                <div className={`font-cabinet-medium text-xs ${
                  holding.pnl >= 0 ? "text-brand-green" : "text-red-500"
                }`}>
                  {holding.pnl >= 0 ? "+" : ""}${holding.pnl.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className={`text-[10px] font-cabinet-regular ${
                  holding.pnlPercentage >= 0 ? "text-brand-green" : "text-red-500"
                }`}>
                  {holding.pnlPercentage >= 0 ? "+" : ""}{holding.pnlPercentage.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
