"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { BiSearch } from "react-icons/bi";
import { IoFilter } from "react-icons/io5";
import { 
  TbArrowDownCircle, 
  TbArrowUpCircle, 
  TbArrowsExchange, 
  TbArrowsShuffle 
} from "react-icons/tb";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { FaCoins } from "react-icons/fa";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "swap" | "transfer";
  status: "completed" | "pending" | "failed";
  asset: string;
  amount: number;
  usdValue: number;
  date: string;
  time: string;
  // Expanded details
  fee?: number;
  fromAddress?: string;
  toAddress?: string;
  txHash?: string;
  network?: string;
  confirmations?: number;
  swapFrom?: string;
  swapTo?: string;
  swapRate?: number;
  recipient?: string;
  note?: string;
}

const TRANSACTIONS: Transaction[] = [
  {
    id: "TXN001",
    type: "deposit",
    status: "completed",
    asset: "BTC",
    amount: 0.5,
    usdValue: 45000,
    date: "2025-10-24",
    time: "14:32:15",
    fee: 0.0001,
    toAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    txHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
    network: "Bitcoin",
    confirmations: 6,
  },
  {
    id: "TXN002",
    type: "withdraw",
    status: "completed",
    asset: "ETH",
    amount: 2.5,
    usdValue: 8750,
    date: "2025-10-24",
    time: "12:15:30",
    fee: 0.005,
    fromAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    toAddress: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    network: "Ethereum",
    confirmations: 12,
  },
  {
    id: "TXN003",
    type: "swap",
    status: "completed",
    asset: "USDT",
    amount: 5000,
    usdValue: 5000,
    date: "2025-10-23",
    time: "18:45:22",
    fee: 15,
    swapFrom: "USDT",
    swapTo: "SOL",
    swapRate: 142.5,
    network: "Solana",
  },
  {
    id: "TXN004",
    type: "transfer",
    status: "completed",
    asset: "USDC",
    amount: 1000,
    usdValue: 1000,
    date: "2025-10-23",
    time: "16:20:45",
    fee: 0,
    recipient: "@john_doe",
    note: "Payment for services",
  },
  {
    id: "TXN005",
    type: "deposit",
    status: "pending",
    asset: "SOL",
    amount: 50,
    usdValue: 7125,
    date: "2025-10-23",
    time: "14:10:00",
    fee: 0.002,
    toAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    txHash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    network: "Solana",
    confirmations: 2,
  },
  {
    id: "TXN006",
    type: "withdraw",
    status: "failed",
    asset: "BTC",
    amount: 0.25,
    usdValue: 22500,
    date: "2025-10-22",
    time: "20:30:15",
    fee: 0.0001,
    fromAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    toAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    network: "Bitcoin",
  },
  {
    id: "TXN007",
    type: "swap",
    status: "completed",
    asset: "ETH",
    amount: 1.5,
    usdValue: 5250,
    date: "2025-10-22",
    time: "11:25:30",
    fee: 10.5,
    swapFrom: "ETH",
    swapTo: "USDT",
    swapRate: 3500,
    network: "Ethereum",
  },
  {
    id: "TXN008",
    type: "transfer",
    status: "completed",
    asset: "USDT",
    amount: 500,
    usdValue: 500,
    date: "2025-10-21",
    time: "09:15:20",
    fee: 0,
    recipient: "@alice_trader",
    note: "Monthly payment",
  },
];

export default function TransactionsTable() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <TbArrowDownCircle className="text-brand-green" />;
      case "withdraw":
        return <TbArrowUpCircle className="text-red-500" />;
      case "swap":
        return <TbArrowsShuffle className="text-purple-500" />;
      case "transfer":
        return <TbArrowsExchange className="text-blue-500" />;
      default:
        return <FaCoins />;
    }
  };

  const getAssetIcon = (asset: string) => {
    switch (asset) {
      case "BTC":
        return <SiBitcoin className="text-orange-500" />;
      case "ETH":
        return <SiEthereum className="text-blue-400" />;
      default:
        return <FaCoins className="text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-brand-green/20 text-brand-green",
      pending: "bg-yellow-500/20 text-yellow-500",
      failed: "bg-red-500/20 text-red-500",
    };
    return styles[status as keyof typeof styles] || styles.completed;
  };

  const filteredTransactions = TRANSACTIONS.filter((tx) => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txHash?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-6">
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl" />
          <input
            type="text"
            placeholder="Search by ID, asset, or transaction hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-green/50 transition-colors font-cabinet-medium"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green/50 transition-colors font-cabinet-medium cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
          <option value="swap">Swap</option>
          <option value="transfer">Transfer</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green/50 transition-colors font-cabinet-medium cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-4 px-4 text-zinc-400 font-cabinet-medium text-sm">
                Type
              </th>
              <th className="text-left py-4 px-4 text-zinc-400 font-cabinet-medium text-sm">
                Transaction ID
              </th>
              <th className="text-left py-4 px-4 text-zinc-400 font-cabinet-medium text-sm">
                Asset
              </th>
              <th className="text-right py-4 px-4 text-zinc-400 font-cabinet-medium text-sm">
                Amount
              </th>
              <th className="text-right py-4 px-4 text-zinc-400 font-cabinet-medium text-sm">
                USD Value
              </th>
              <th className="text-left py-4 px-4 text-zinc-400 font-cabinet-medium text-sm">
                Date & Time
              </th>
              <th className="text-center py-4 px-4 text-zinc-400 font-cabinet-medium text-sm">
                Status
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <>
                <tr
                  key={tx.id}
                  onClick={() => toggleRow(tx.id)}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{getTypeIcon(tx.type)}</div>
                      <span className="text-white font-cabinet-medium capitalize text-sm">
                        {tx.type}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-zinc-300 font-cabinet-medium text-sm">
                      {tx.id}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="text-xl">{getAssetIcon(tx.asset)}</div>
                      <span className="text-white font-cabinet-medium text-sm">
                        {tx.asset}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-white font-cabinet-medium text-sm">
                      {tx.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 6,
                      })}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-white font-cabinet-medium text-sm">
                      ${tx.usdValue.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <div className="text-white font-cabinet-medium">{tx.date}</div>
                      <div className="text-zinc-400 text-xs">{tx.time}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-cabinet-medium capitalize ${getStatusBadge(
                        tx.status
                      )}`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-zinc-400 text-lg">
                      {expandedRow === tx.id ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRow === tx.id && (
                  <tr className="bg-zinc-800/20 border-b border-zinc-800/50">
                    <td colSpan={8} className="py-6 px-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-white font-cabinet-bold text-lg mb-4">
                            Transaction Details
                          </h3>
                          
                          {tx.fee !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-zinc-400 text-sm font-cabinet-medium">
                                Network Fee:
                              </span>
                              <span className="text-white text-sm font-cabinet-medium">
                                {tx.fee} {tx.asset}
                              </span>
                            </div>
                          )}

                          {tx.network && (
                            <div className="flex justify-between">
                              <span className="text-zinc-400 text-sm font-cabinet-medium">
                                Network:
                              </span>
                              <span className="text-white text-sm font-cabinet-medium">
                                {tx.network}
                              </span>
                            </div>
                          )}

                          {tx.confirmations !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-zinc-400 text-sm font-cabinet-medium">
                                Confirmations:
                              </span>
                              <span className="text-white text-sm font-cabinet-medium">
                                {tx.confirmations}/6
                              </span>
                            </div>
                          )}

                          {tx.swapFrom && tx.swapTo && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-zinc-400 text-sm font-cabinet-medium">
                                  Swap From:
                                </span>
                                <span className="text-white text-sm font-cabinet-medium">
                                  {tx.swapFrom}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400 text-sm font-cabinet-medium">
                                  Swap To:
                                </span>
                                <span className="text-white text-sm font-cabinet-medium">
                                  {tx.swapTo}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400 text-sm font-cabinet-medium">
                                  Exchange Rate:
                                </span>
                                <span className="text-white text-sm font-cabinet-medium">
                                  1 {tx.swapFrom} = {tx.swapRate} {tx.swapTo}
                                </span>
                              </div>
                            </>
                          )}

                          {tx.recipient && (
                            <div className="flex justify-between">
                              <span className="text-zinc-400 text-sm font-cabinet-medium">
                                Recipient:
                              </span>
                              <span className="text-white text-sm font-cabinet-medium">
                                {tx.recipient}
                              </span>
                            </div>
                          )}

                          {tx.note && (
                            <div className="flex justify-between">
                              <span className="text-zinc-400 text-sm font-cabinet-medium">
                                Note:
                              </span>
                              <span className="text-white text-sm font-cabinet-medium">
                                {tx.note}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-white font-cabinet-bold text-lg mb-4">
                            Addresses & Hash
                          </h3>

                          {tx.fromAddress && (
                            <div>
                              <span className="text-zinc-400 text-xs font-cabinet-medium block mb-1">
                                From Address:
                              </span>
                              <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700/30">
                                <code className="text-white text-xs font-mono break-all">
                                  {tx.fromAddress}
                                </code>
                              </div>
                            </div>
                          )}

                          {tx.toAddress && (
                            <div>
                              <span className="text-zinc-400 text-xs font-cabinet-medium block mb-1">
                                To Address:
                              </span>
                              <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700/30">
                                <code className="text-white text-xs font-mono break-all">
                                  {tx.toAddress}
                                </code>
                              </div>
                            </div>
                          )}

                          {tx.txHash && (
                            <div>
                              <span className="text-zinc-400 text-xs font-cabinet-medium block mb-1">
                                Transaction Hash:
                              </span>
                              <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700/30">
                                <code className="text-white text-xs font-mono break-all">
                                  {tx.txHash}
                                </code>
                              </div>
                              <button className="mt-2 text-brand-green hover:text-brand-green/80 text-xs font-cabinet-medium transition-colors">
                                View on Explorer →
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400 font-cabinet-medium">
              No transactions found matching your filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination info */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-zinc-400 text-sm font-cabinet-medium">
          Showing {filteredTransactions.length} of {TRANSACTIONS.length} transactions
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white text-sm font-cabinet-medium hover:bg-zinc-800 transition-colors">
            Previous
          </button>
          <button className="px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white text-sm font-cabinet-medium hover:bg-zinc-800 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
