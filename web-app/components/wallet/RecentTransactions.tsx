"use client";

interface RecentTransaction {
  type: string;
  amount: string;
  currency: string;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  address?: string;
}

const RECENT_TRANSACTIONS: RecentTransaction[] = [
  {
    type: "Deposit",
    amount: "+500",
    currency: "USDT",
    status: "completed",
    timestamp: "2h ago",
    address: "0x742d...3a4f",
  },
  {
    type: "Withdrawal",
    amount: "-250",
    currency: "ZXL",
    status: "completed",
    timestamp: "1d ago",
    address: "0x932c...2b1e",
  },
  {
    type: "Swap",
    amount: "100 ZXL",
    currency: "0.032 ETH",
    status: "completed",
    timestamp: "4d ago",
  },
  {
    type: "Transfer",
    amount: "-50",
    currency: "BTC",
    status: "pending",
    timestamp: "5d ago",
    address: "0x123a...9c8d",
  },
  {
    type: "Deposit",
    amount: "+1000",
    currency: "USDT",
    status: "completed",
    timestamp: "1w ago",
    address: "0x456b...7e2f",
  },
];

export default function RecentTransactions() {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-white text-2xl font-cabinet-bold">Recent Transactions</h2>
        <button className="text-brand-green text-sm font-cabinet-medium hover:underline">
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {RECENT_TRANSACTIONS.map((transaction, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 hover:bg-zinc-900/70 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-white font-cabinet-medium text-base">
                  {transaction.type}
                </span>
                {transaction.address && (
                  <div className="text-zinc-500 text-xs font-cabinet-regular mt-1">
                    {transaction.address}
                  </div>
                )}
              </div>
              <span className="text-xs text-zinc-500 font-cabinet-regular">
                {transaction.timestamp}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className={`text-base font-cabinet-medium ${
                transaction.amount.startsWith('+') 
                  ? "text-brand-green" 
                  : transaction.amount.startsWith('-')
                  ? "text-red-500"
                  : "text-white"
              }`}>
                {transaction.amount} {transaction.currency}
              </span>
              <span className={`text-xs font-cabinet-medium px-2 py-1 rounded-lg ${
                transaction.status === "completed" 
                  ? "bg-brand-green/20 text-brand-green" 
                  : transaction.status === "pending"
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "bg-red-500/20 text-red-500"
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
