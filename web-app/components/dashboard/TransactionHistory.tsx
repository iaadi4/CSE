"use client";

interface Transaction {
  type: string;
  amount: string;
  currency: string;
  timestamp: string;
  status: string;
}

const TRANSACTION_DATA: Transaction[] = [
  {
    type: "Deposit",
    amount: "+500",
    currency: "USDT",
    timestamp: "2h ago",
    status: "completed",
  },
  {
    type: "Withdrawal",
    amount: "-250",
    currency: "ZXL",
    timestamp: "1d ago",
    status: "completed",
  },
  {
    type: "Swap",
    amount: "100 ZXL + 0.032",
    currency: "ETH",
    timestamp: "4d ago",
    status: "completed",
  },
  {
    type: "Staking",
    amount: "Staked 500",
    currency: "ZIX",
    timestamp: "7d ago",
    status: "active",
  },
];

export default function TransactionHistory() {
  return (
    <div className="h-full flex flex-col p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-lg font-cabinet-bold">Transaction History</h2>
        <button className="px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900/70 transition-colors">
          <span className="text-xs text-white font-cabinet-medium">All</span>
        </button>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {TRANSACTION_DATA.map((transaction, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 hover:bg-zinc-900/70 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-cabinet-medium text-white">
                {transaction.type}
              </span>
              <span className="text-xs text-zinc-500 font-cabinet-regular">
                {transaction.timestamp}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-cabinet-medium ${
                transaction.amount.startsWith('+') 
                  ? "text-brand-green" 
                  : transaction.amount.startsWith('-')
                  ? "text-red-500"
                  : "text-white"
              }`}>
                {transaction.amount} {transaction.currency}
              </span>
              <span className={`text-xs font-cabinet-regular ${
                transaction.status === "active" 
                  ? "text-yellow-500" 
                  : "text-zinc-500"
              }`}>
                {transaction.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
