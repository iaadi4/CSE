"use client";

import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { RiArrowDownLine } from "react-icons/ri";

interface SwapDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CRYPTO_OPTIONS = [
  { symbol: "USDT", name: "Tether", balance: 12456.87, price: 1.00 },
  { symbol: "USDC", name: "USD Coin", balance: 5000.00, price: 1.00 },
  { symbol: "ETH", name: "Ethereum", balance: 2.3, price: 2275.45 },
  { symbol: "SOL", name: "Solana", balance: 45.2, price: 45.01 },
  { symbol: "BTC", name: "Bitcoin", balance: 0.15, price: 48032.32 },
];

export default function SwapDialog({ isOpen, onClose }: SwapDialogProps) {
  const [fromCrypto, setFromCrypto] = useState("USDT");
  const [toCrypto, setToCrypto] = useState("ETH");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const fromBalance = CRYPTO_OPTIONS.find(c => c.symbol === fromCrypto)?.balance || 0;
  const fromPrice = CRYPTO_OPTIONS.find(c => c.symbol === fromCrypto)?.price || 0;
  const toPrice = CRYPTO_OPTIONS.find(c => c.symbol === toCrypto)?.price || 0;

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && fromPrice && toPrice) {
      const calculated = (parseFloat(value) * fromPrice) / toPrice;
      setToAmount(calculated.toFixed(8));
    } else {
      setToAmount("");
    }
  };

  const handleSwapDirection = () => {
    setFromCrypto(toCrypto);
    setToCrypto(fromCrypto);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-[500px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-cabinet-bold">Swap Crypto</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* From */}
        <div className="mb-4">
          <label className="text-zinc-400 text-sm font-cabinet-medium mb-2 block">From</label>
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <select
                value={fromCrypto}
                onChange={(e) => setFromCrypto(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-cabinet-medium focus:outline-none focus:border-brand-green transition-colors"
              >
                {CRYPTO_OPTIONS.map((crypto) => (
                  <option key={crypto.symbol} value={crypto.symbol}>
                    {crypto.symbol}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-right text-white text-xl font-cabinet-bold focus:outline-none w-full ml-4"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 font-cabinet-regular">Available: {fromBalance}</span>
              <button
                onClick={() => handleFromAmountChange(fromBalance.toString())}
                className="text-brand-green font-cabinet-medium hover:underline"
              >
                Max
              </button>
            </div>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleSwapDirection}
            className="bg-zinc-800 border border-zinc-700 rounded-full p-3 hover:bg-zinc-700 transition-colors"
          >
            <RiArrowDownLine className="text-white text-xl" />
          </button>
        </div>

        {/* To */}
        <div className="mb-6">
          <label className="text-zinc-400 text-sm font-cabinet-medium mb-2 block">To</label>
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <select
                value={toCrypto}
                onChange={(e) => setToCrypto(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-cabinet-medium focus:outline-none focus:border-brand-green transition-colors"
              >
                {CRYPTO_OPTIONS.map((crypto) => (
                  <option key={crypto.symbol} value={crypto.symbol}>
                    {crypto.symbol}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={toAmount}
                readOnly
                placeholder="0.00"
                className="bg-transparent text-right text-white text-xl font-cabinet-bold focus:outline-none w-full ml-4"
              />
            </div>
            <div className="text-right text-sm">
              <span className="text-zinc-500 font-cabinet-regular">≈ ${toAmount && toPrice ? (parseFloat(toAmount) * toPrice).toFixed(2) : "0.00"}</span>
            </div>
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-zinc-400 text-sm font-cabinet-regular">Exchange Rate</span>
            <span className="text-white text-sm font-cabinet-medium">
              1 {fromCrypto} ≈ {fromPrice && toPrice ? (fromPrice / toPrice).toFixed(6) : "0"} {toCrypto}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400 text-sm font-cabinet-regular">Estimated Fee</span>
            <span className="text-white text-sm font-cabinet-medium">0.3%</span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
          <p className="text-purple-400 text-xs font-cabinet-regular">
            ℹ️ The final amount may vary slightly due to market fluctuations.
          </p>
        </div>

        {/* Submit Button */}
        <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-cabinet-bold py-3 rounded-xl transition-colors">
          Swap
        </button>
      </div>
    </div>
  );
}
