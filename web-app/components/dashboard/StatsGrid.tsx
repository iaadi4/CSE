"use client";

import { TbTrendingUp, TbTrendingDown } from "react-icons/tb";
import { FaChartLine } from "react-icons/fa6";
import { RiShieldCheckLine } from "react-icons/ri";

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  isPercentage?: boolean;
}

const STATS_DATA: StatItem[] = [
  {
    icon: <TbTrendingUp />,
    label: "Average Win",
    value: "$987.47",
    isPercentage: false,
  },
  {
    icon: <TbTrendingDown />,
    label: "Average Loss",
    value: "-$781.70",
    isPercentage: false,
  },
  {
    icon: <FaChartLine />,
    label: "Win Ratio",
    value: "66%",
    isPercentage: true,
  },
  {
    icon: <RiShieldCheckLine />,
    label: "Risk Reward",
    value: "66%",
    isPercentage: true,
  },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 p-3 h-full">
      {STATS_DATA.map((stat, index) => (
        <div
          key={index}
          className="bg-zinc-900/50 border-b border-x border-zinc-800/50 rounded-xl p-3 flex flex-col justify-between hover:bg-zinc-900/70 transition-colors relative overflow-hidden"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          {/* Subtle white glow from top */}
          <div 
            className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%)',
            }}
          />
          
          <div className="flex items-center gap-1.5 text-zinc-400 mb-2 relative z-10">
            <div className="text-base">{stat.icon}</div>
            <span className="text-sm font-cabinet-medium">{stat.label}</span>
          </div>
          <div className="text-white text-xl font-cabinet-bold relative z-10">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
