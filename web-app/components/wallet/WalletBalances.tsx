"use client";

import { useEffect, useState } from "react";
import { LuBitcoin } from "react-icons/lu";
import { FaEthereum } from "react-icons/fa";
import { SiSolana, SiBnbchain } from "react-icons/si";
import { BalanceApi, Balance } from "@/lib/api";

interface WalletBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change: string;
  icon: React.ReactNode;
  available: number;
  locked: number;
}

// Currency icons mapping
const CURRENCY_ICONS: Record<string, React.ReactNode> = {
  USDC: <img src="/images/icons/usdc.png" alt="USDC" className="w-full h-full" />,
  USDT: <img src="/images/icons/tether.png" alt="USDT" className="w-full h-full" />,
  ETH: <FaEthereum />,
  SOL: <SiSolana />,
  BTC: <LuBitcoin />,
  BNB: <SiBnbchain />,
};

// Currency names mapping
const CURRENCY_NAMES: Record<string, string> = {
  USDC: "USD Coin",
  USDT: "Tether",
  ETH: "Ethereum",
  SOL: "Solana",
  BTC: "Bitcoin",
  BNB: "BNB",
};

export default function WalletBalances() {
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setLoading(true);
        const response = await BalanceApi.getBalances();

        if (response.data.ok) {
          const balanceData = response.data.data.balances;
          const walletBalances: WalletBalance[] = [];

          // Convert API response to WalletBalance format
          Object.entries(balanceData).forEach(([currency, balance]) => {
            const available = balance.available;
            const locked = balance.locked;
            const total = available + locked;

            walletBalances.push({
              symbol: currency,
              name: CURRENCY_NAMES[currency] || currency,
              balance: total,
              usdValue: total, // For now, assume 1:1 with USD for stablecoins
              change: "+0.00%", // Placeholder
              icon: CURRENCY_ICONS[currency] || <div className="w-full h-full bg-zinc-600 rounded-full" />,
              available,
              locked,
            });
          });

          setBalances(walletBalances);
          setTotalBalance(walletBalances.reduce((sum, item) => sum + item.usdValue, 0));
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error("Failed to fetch balances:", err);
        setError("Failed to load balances");
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="mb-6">
          <h2 className="text-zinc-400 text-base font-cabinet-medium mb-2">Total Balance</h2>
          <div className="text-white text-4xl font-cabinet-bold">Loading...</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zinc-400">Loading balances...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="mb-6">
          <h2 className="text-zinc-400 text-base font-cabinet-medium mb-2">Total Balance</h2>
          <div className="text-white text-4xl font-cabinet-bold">$0.00</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

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
        {balances.map((asset, index) => (
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
                {asset.locked > 0 && (
                  <div className="text-zinc-500 text-xs font-cabinet-regular">
                    Locked: {asset.locked.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                  </div>
                )}
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
