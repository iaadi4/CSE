"use client";

interface TradeHistoryItem {
  type: "Buy" | "Sell";
  asset: string;
  amount: number;
  price: number;
  total: number;
  date: string;
  time: string;
}

const TRADE_HISTORY: TradeHistoryItem[] = [
  {
    type: "Buy",
    asset: "ETH",
    amount: 0.5,
    price: 2275.45,
    total: 1137.73,
    date: "2025-10-24",
    time: "14:32",
  },
  {
    type: "Sell",
    asset: "BTC",
    amount: 0.02,
    price: 48032.32,
    total: 960.65,
    date: "2025-10-23",
    time: "09:15",
  },
  {
    type: "Buy",
    asset: "SOL",
    amount: 25.0,
    price: 45.01,
    total: 1125.25,
    date: "2025-10-22",
    time: "16:48",
  },
  {
    type: "Buy",
    asset: "USDT",
    amount: 5000.0,
    price: 1.0,
    total: 5000.0,
    date: "2025-10-21",
    time: "11:20",
  },
  {
    type: "Sell",
    asset: "SOL",
    amount: 10.0,
    price: 44.85,
    total: 448.5,
    date: "2025-10-20",
    time: "13:05",
  },
  {
    type: "Buy",
    asset: "BTC",
    amount: 0.1,
    price: 45200.0,
    total: 4520.0,
    date: "2025-10-19",
    time: "10:30",
  },
];

export default function TradeHistory() {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-white text-lg font-cabinet-bold">Trade History</h2>
        <button className="text-brand-green text-xs font-cabinet-medium hover:underline">
          View All
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[0.8fr_0.8fr_1fr_1fr_1fr_1.4fr] gap-2 px-2 pb-2 border-b border-zinc-800">
        <div className="text-zinc-500 text-xs font-cabinet-medium">Type</div>
        <div className="text-zinc-500 text-xs font-cabinet-medium">Asset</div>
        <div className="text-zinc-500 text-xs font-cabinet-medium text-right">Amount</div>
        <div className="text-zinc-500 text-xs font-cabinet-medium text-right">Price</div>
        <div className="text-zinc-500 text-xs font-cabinet-medium text-right">Total</div>
        <div className="text-zinc-500 text-xs font-cabinet-medium text-right">Date</div>
      </div>

      {/* Trade List */}
      <div className="flex-1 overflow-y-auto">
        {TRADE_HISTORY.map((trade, index) => (
          <div
            key={index}
            className="grid grid-cols-[0.8fr_0.8fr_1fr_1fr_1fr_1.4fr] gap-2 px-2 py-2 hover:bg-zinc-900/30 transition-colors rounded-lg items-center"
          >
            {/* Type */}
            <div>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-cabinet-medium ${
                  trade.type === "Buy"
                    ? "bg-brand-green/20 text-brand-green"
                    : "bg-red-500/20 text-red-500"
                }`}
              >
                {trade.type}
              </span>
            </div>

            {/* Asset */}
            <div className="text-white font-cabinet-medium text-xs">
              {trade.asset}
            </div>

            {/* Amount */}
            <div className="text-right text-white font-cabinet-regular text-xs">
              {trade.amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}
            </div>

            {/* Price */}
            <div className="text-right text-white font-cabinet-regular text-xs">
              ${trade.price.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>

            {/* Total */}
            <div className="text-right text-white font-cabinet-medium text-xs">
              ${trade.total.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>

            {/* Date & Time */}
            <div className="text-right">
              <div className="text-white text-xs font-cabinet-regular">
                {trade.date}
              </div>
              <div className="text-zinc-500 text-[10px] font-cabinet-regular">
                {trade.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
