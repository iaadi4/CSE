"use client";

import { LuBitcoin } from "react-icons/lu";
import { FaEthereum } from "react-icons/fa";
import { SiSolana, SiBnbchain } from "react-icons/si";

interface WalletBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change: string;
  icon: React.ReactNode;
}

const WALLET_BALANCES: WalletBalance[] = [
  {
    symbol: "USDT",
    name: "Tether",
    balance: 12456.87,
    usdValue: 12456.87,
    change: "+0.01%",
    icon: <img src="/images/icons/tether.png" alt="USDT" className="w-full h-full" />,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: 5000.00,
    usdValue: 5000.00,
    change: "+0.00%",
    icon: <img src="/images/icons/usdc.png" alt="USDC" className="w-full h-full" />,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: 2.3,
    usdValue: 5234.56,
    change: "+0.03%",
    icon: <FaEthereum />,
  },
  {
    symbol: "SOL",
    name: "Solana",
    balance: 45.2,
    usdValue: 2034.12,
    change: "+0.02%",
    icon: <SiSolana />,
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: 0.15,
    usdValue: 7204.85,
    change: "+0.10%",
    icon: <LuBitcoin />,
  },
];

export default function WalletBalances() {
  const totalBalance = WALLET_BALANCES.reduce((sum, item) => sum + item.usdValue, 0);

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header with Total Balance */}
      <div className="mb-6">
        <h2 className="text-zinc-400 text-base font-cabinet-medium mb-2">Total Balance</h2>
        <div className="text-white text-4xl font-cabinet-bold">
          ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Balances List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {WALLET_BALANCES.map((asset, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 hover:bg-zinc-900/70 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl bg-zinc-800">
                  {asset.icon}
                </div>
                <div>
                  <div className="text-white font-cabinet-medium text-base">
                    {asset.symbol}
                  </div>
                  <div className="text-zinc-500 text-sm font-cabinet-regular">
                    {asset.name}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-white font-cabinet-medium text-base">
                  {asset.balance.toLocaleString('en-US', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8 
                  })}
                </div>
                <div className="text-zinc-400 text-sm font-cabinet-regular">
                  ${asset.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="text-brand-green text-sm font-cabinet-medium">
                {asset.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
