"use client";

import { useState } from "react";
import { useTrades } from "@/providers/TradesProvider";
import { PriceChart } from "./PriceChart";

const timeOptions = [
  { label: "1m", value: "1min" },
  { label: "1H", value: "1h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
];

export const TradeView = ({ market }: { market: string }) => {
  const [selectedTime, setSelectedTime] = useState("1m");
  const { trades } = useTrades();

  return (
    <div className="h-full bg-[#121212] border-[#262626] rounded-xl border overflow-hidden flex flex-col">
      <div className="w-full py-2 px-3 flex items-center relative justify-between leading-[16px] text-[#d4d4d8] border-b border-[#262626]">
        <div className="w-[20%] text-sm">SOL - USDC</div>
        <div className="flex space-x-2">
          <div className="w-[20%] py-1 text-xs">Time</div>

          {timeOptions.map((option) => (
            <button
              key={option.label}
              className={`px-2 text-xs ${
                selectedTime === option.value
                  ? "text-white font-bold"
                  : "text-[#d4d4d8]"
              }`}
              onClick={() => setSelectedTime(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="w-[15%] text-right my-1">
          <div className="font-semibold text-xs">Trading View</div>
        </div>
      </div>

      <div className="flex-1 w-full">
        <PriceChart trades={trades} />
      </div>
    </div>
  );
};
