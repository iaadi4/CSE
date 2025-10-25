"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { LuBitcoin } from "react-icons/lu";
import { FaEthereum } from "react-icons/fa";
import { SiSolana } from "react-icons/si";

interface DepositDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CryptoOption {
  symbol: string;
  name: string;
  icon: React.ReactNode;
  supportedChains: string[];
}

const CRYPTO_OPTIONS: CryptoOption[] = [
  { 
    symbol: "USDT", 
    name: "Tether", 
    icon: <img src="/images/icons/tether.png" alt="USDT" className="w-full h-full" />,
    supportedChains: ["Ethereum", "Solana"]
  },
  { 
    symbol: "USDC", 
    name: "USD Coin", 
    icon: <img src="/images/icons/usdc.png" alt="USDC" className="w-full h-full" />,
    supportedChains: ["Ethereum", "Solana"]
  },
  { 
    symbol: "ETH", 
    name: "Ethereum", 
    icon: <FaEthereum />,
    supportedChains: ["Ethereum"]
  },
  { 
    symbol: "SOL", 
    name: "Solana", 
    icon: <SiSolana />,
    supportedChains: ["Solana"]
  },
  { 
    symbol: "BTC", 
    name: "Bitcoin", 
    icon: <LuBitcoin />,
    supportedChains: ["Bitcoin"]
  },
];

export default function DepositDialog({ isOpen, onClose }: DepositDialogProps) {
  const [selectedCrypto, setSelectedCrypto] = useState("USDT");
  const [network, setNetwork] = useState("Ethereum");

  const selectedCryptoData = CRYPTO_OPTIONS.find(c => c.symbol === selectedCrypto);
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
          <h2 className="text-white text-2xl font-cabinet-bold">Deposit Crypto</h2>
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
                {crypto.symbol} - {crypto.name}
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

        {/* Deposit Address */}
        <div className="mb-6">
          <label className="text-zinc-400 text-sm font-cabinet-medium mb-2 block">Deposit Address</label>
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
            <p className="text-white text-sm font-mono break-all mb-3">
              0x742d35Cc6634C0532925a3b844Bc9e7595f3a4f
            </p>
            <button className="w-full bg-brand-green hover:bg-brand-green/80 text-white font-cabinet-medium py-2 rounded-lg transition-colors">
              Copy Address
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-xl flex items-center justify-center">
            <div className="w-48 h-48 bg-zinc-200 rounded-lg flex items-center justify-center">
              <span className="text-zinc-500 text-sm">QR Code</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-500 text-xs font-cabinet-regular">
            ⚠️ Send only {selectedCrypto} to this address. Sending any other asset will result in permanent loss.
          </p>
        </div>
      </div>
    </div>
  );
}
