"use client";

import { TbTrendingUp, TbTrendingDown } from "react-icons/tb";
import { FaChartLine, FaCoins } from "react-icons/fa6";
import { RiPieChartLine } from "react-icons/ri";
import { BiDollar } from "react-icons/bi";

interface MetricCard {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

const METRICS: MetricCard[] = [
  {
    icon: <BiDollar />,
    label: "Total Invested",
    value: "$31,140.52",
    change: undefined,
  },
  {
    icon: <TbTrendingUp />,
    label: "Total Profit",
    value: "$765.73",
    change: "+2.52%",
    isPositive: true,
  },
  {
    icon: <FaChartLine />,
    label: "Best Performer",
    value: "SOL",
    change: "+6.40%",
    isPositive: true,
  },
  {
    icon: <TbTrendingDown />,
    label: "Worst Performer",
    value: "USDT",
    change: "0.00%",
    isPositive: false,
  },
  {
    icon: <RiPieChartLine />,
    label: "Total Assets",
    value: "5",
    change: "3 Chains",
  },
  {
    icon: <FaCoins />,
    label: "24h Volume",
    value: "$2,458.90",
    change: "+12.3%",
    isPositive: true,
  },
];

export default function PortfolioMetrics() {
  return (
    <div className="bg-zinc-900/50 rounded-2xl p-4 h-full flex flex-col">
      <h2 className="text-xl font-cabinet-bold text-white mb-3">
        Portfolio Metrics
      </h2>
      <div className="flex gap-3 flex-1">
        {METRICS.map((metric, index) => (
          <div
            key={index}
            className="relative bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 overflow-hidden group hover:border-brand-green/30 transition-all duration-300 flex-1"
          >
            {/* Subtle white glow from top */}
            <div
              className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%)",
              }}
            />

            <div className="flex items-center gap-2 text-zinc-400 mb-2 relative z-10">
              <div className="text-base">{metric.icon}</div>
              <span className="text-xs font-cabinet-medium">{metric.label}</span>
            </div>
            <div className="relative z-10">
              <div className="text-white text-xl font-cabinet-bold mb-1">
                {metric.value}
              </div>
              {metric.change && (
                <div
                  className={`text-xs font-cabinet-medium ${
                    metric.isPositive ? "text-brand-green" : "text-zinc-500"
                  }`}
                >
                  {metric.change}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
