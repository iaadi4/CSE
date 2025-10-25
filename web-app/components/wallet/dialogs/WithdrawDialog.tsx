"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface WithdrawDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CryptoOption {
  symbol: string;
  name: string;
  balance: number;
  supportedChains: string[];
}

const CRYPTO_OPTIONS: CryptoOption[] = [
  { 
    symbol: "USDT", 
    name: "Tether", 
    balance: 12456.87,
    supportedChains: ["Ethereum", "Solana"]
  },
  { 
    symbol: "USDC", 
    name: "USD Coin", 
    balance: 5000.00,
    supportedChains: ["Ethereum", "Solana"]
  },
  { 
    symbol: "ETH", 
    name: "Ethereum", 
    balance: 2.3,
    supportedChains: ["Ethereum"]
  },
  { 
    symbol: "SOL", 
    name: "Solana", 
    balance: 45.2,
    supportedChains: ["Solana"]
  },
  { 
    symbol: "BTC", 
    name: "Bitcoin", 
    balance: 0.15,
    supportedChains: ["Bitcoin"]
  },
];

export default function WithdrawDialog({ isOpen, onClose }: WithdrawDialogProps) {
  const [selectedCrypto, setSelectedCrypto] = useState("USDT");
  const [network, setNetwork] = useState("Ethereum");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const selectedCryptoData = CRYPTO_OPTIONS.find(c => c.symbol === selectedCrypto);
  const selectedBalance = selectedCryptoData?.balance || 0;
  const supportedChains = selectedCryptoData?.supportedChains || [];

  // Update network when crypto changes
  useEffect(() => {
    if (supportedChains.length > 0 && !supportedChains.includes(network)) {
      setNetwork(supportedChains[0]);
    }
  }, [selectedCrypto]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-[500px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-cabinet-bold">Withdraw Crypto</h2>
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

        {/* Select Network */}
        <div className="mb-6">
          <label className="text-zinc-400 text-sm font-cabinet-medium mb-2 block">Select Network</label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white font-cabinet-medium focus:outline-none focus:border-brand-green transition-colors"
          >
            {supportedChains.map((chain) => (
              <option key={chain} value={chain}>
                {chain}
              </option>
            ))}
          </select>
        </div>

        {/* Withdrawal Address */}
        <div className="mb-6">
          <label className="text-zinc-400 text-sm font-cabinet-medium mb-2 block">Withdrawal Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter wallet address"
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

        {/* Fee Estimate */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-zinc-400 text-sm font-cabinet-regular">Network Fee</span>
            <span className="text-white text-sm font-cabinet-medium">~0.0005 ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400 text-sm font-cabinet-regular">You will receive</span>
            <span className="text-white text-sm font-cabinet-medium">{amount || "0"} {selectedCrypto}</span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-red-500 text-xs font-cabinet-regular">
            ⚠️ Double check the address and network. Withdrawals cannot be reversed.
          </p>
        </div>

        {/* Submit Button */}
        <button className="w-full bg-red-500 hover:bg-red-600 text-white font-cabinet-bold py-3 rounded-xl transition-colors">
          Withdraw
        </button>
      </div>
    </div>
  );
}
