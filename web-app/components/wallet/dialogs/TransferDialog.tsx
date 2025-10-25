"use client";

import { useState } from "react";
import { IoClose } from "react-icons/io5";

interface TransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CRYPTO_OPTIONS = [
  { symbol: "USDT", name: "Tether", balance: 12456.87 },
  { symbol: "USDC", name: "USD Coin", balance: 5000.00 },
  { symbol: "ETH", name: "Ethereum", balance: 2.3 },
  { symbol: "SOL", name: "Solana", balance: 45.2 },
  { symbol: "BTC", name: "Bitcoin", balance: 0.15 },
];

export default function TransferDialog({ isOpen, onClose }: TransferDialogProps) {
  const [selectedCrypto, setSelectedCrypto] = useState("USDT");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const selectedBalance = CRYPTO_OPTIONS.find(c => c.symbol === selectedCrypto)?.balance || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-[500px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-cabinet-bold">Transfer to User</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Select Cryptocurrency */}
        <div className="mb-6">
          <label className="text-zinc-400 text-sm font-cabinet-medium mb-2 block">Select Cryptocurrency</label>
          <select
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white font-cabinet-medium focus:outline-none focus:border-brand-green transition-colors"
          >
            {CRYPTO_OPTIONS.map((crypto) => (
              <option key={crypto.symbol} value={crypto.symbol}>
                {crypto.symbol} - Available: {crypto.balance}
              </option>
            ))}
          </select>
        </div>

        {/* Recipient */}
        <div className="mb-6">
          <label className="text-zinc-400 text-sm font-cabinet-medium mb-2 block">Recipient</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter username, email, or user ID"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white font-cabinet-regular placeholder:text-zinc-500 focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>

        {/* Amount */}
        <div className="mb-6">
          <label className="text-zinc-400 text-sm font-cabinet-medium mb-2 block">Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white font-cabinet-regular placeholder:text-zinc-500 focus:outline-none focus:border-brand-green transition-colors"
            />
            <button
              onClick={() => setAmount(selectedBalance.toString())}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-green text-sm font-cabinet-medium hover:underline"
            >
              Max
            </button>
          </div>
          <p className="text-zinc-500 text-xs font-cabinet-regular mt-2">
            Available: {selectedBalance} {selectedCrypto}
          </p>
        </div>

        {/* Note (Optional) */}
        <div className="mb-6">
          <label className="text-zinc-400 text-sm font-cabinet-medium mb-2 block">Note (Optional)</label>
          <textarea
            placeholder="Add a note for this transfer"
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white font-cabinet-regular placeholder:text-zinc-500 focus:outline-none focus:border-brand-green transition-colors resize-none"
          />
        </div>

        {/* Transfer Summary */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-zinc-400 text-sm font-cabinet-regular">Transfer Fee</span>
            <span className="text-white text-sm font-cabinet-medium">Free</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400 text-sm font-cabinet-regular">Recipient will receive</span>
            <span className="text-white text-sm font-cabinet-medium">{amount || "0"} {selectedCrypto}</span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-blue-400 text-xs font-cabinet-regular">
            ℹ️ Internal transfers are instant and free of charge.
          </p>
        </div>

        {/* Submit Button */}
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-cabinet-bold py-3 rounded-xl transition-colors">
          Transfer
        </button>
      </div>
    </div>
  );
}
