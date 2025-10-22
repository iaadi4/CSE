"use client";

import { useEffect } from "react";
import { getTicker } from "@/lib/exchange-api";
import { useTrades } from "@/providers/TradesProvider";

export const MarketBar = ({ market }: { market: string }) => {
  const { ticker, setTicker, stats, setStats, price } = useTrades();

  useEffect(() => {
    // Fetch ticker data only once on mount or when market changes
    getTicker(market).then((data) => {
      setTicker(data);
      setStats([
        { label: "24h Volume", value: `$${parseFloat(data.volume).toLocaleString()}` },
        { label: "24h High", value: `$${data.high}` },
        { label: "24h Low", value: `$${data.low}` },
      ]);
    });
  }, [market, setStats, setTicker]);

  return (
    <div className="inline-flex items-center justify-center w-full h-full">
      <div className="h-full bg-[#121212] overflow-hidden flex flex-col justify-center w-[308px] min-w-[100px] rounded-l-xl border border-[#262626]">
        <div className="z-40 h-full flex flex-row w-full items-center justify-center gap-2 bg-[#121212] text-[#d4d4d8] relative hover:bg-[#262626] sm:p-2">
          <div className="flex items-center justify-center">
            <div>
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-purple-500 to-blue-500 relative z-10" />
            </div>
            <div className="-ml-[20%]">
              <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-green-500" />
            </div>
          </div>
          <span className="text-[#d4d4d8] hidden md:block text-[18px] font-semibold">
            SOL/USDC
          </span>
        </div>
      </div>
      <div className="relative flex items-center justify-start w-full border border-l-0 border-[#262626] bg-[#121212] h-full overflow-x-auto rounded-r-xl">
        <div className="flex justify-between sm:justify-start font-display whitespace-nowrap">
          <div className="flex flex-row items-center justify-between px-4 py-2 space-x-3 xl:space-x-4 xl:px-6 sm:py-0">
            <div className="outline-none focus:outline-none flex">
              <div className="flex flex-col">
                <div className="block h-2 w-2 rounded-full bg-[#34cb88] mr-1"></div>
              </div>
            </div>
            <div className="outline-none focus:outline-none flex mr-0 sm:mr-0">
              <div className="flex flex-col">
                <div className="overflow-hidden text-lg text-[#d4d4d8]">
                  <span className="text-[18px] leading-[-0.25px]">
                    <span className="whitespace-nowrap">${price}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="outline-none focus:outline-none flex mr-20 sm:mr-0">
              <div className="flex flex-col left-10">
                <div className="block overflow-hidden">
                  <span className="font-semibold text-[13px] leading-[16px]">
                    <div className="">
                      <span className="text-[#34cb88] flex items-center">
                        {ticker?.priceChange}%
                      </span>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {stats.map((stat, index) => (
          <div
            key={index}
            className="px-2 xl:px-6 hidden md:flex flex-col justify-center"
          >
            <div className="outline-none focus:outline-none flex">
              <div className="flex flex-col">
                <span className="font-semibold text-[11px] leading-[12px] tracking-[.15px]">
                  <div className="border-r border-[#262626]"></div>
                  <div className="flex flex-col">
                    <div className="text-nowrap overflow-hidden text-[#a3a3a3]">
                      {stat.label}
                    </div>
                    <span className="shrink-0 w-full pb-1"></span>
                    <div className="flex items-center grow">
                      <div className="flex flex-col text-[#d4d4d8]">
                        <div className="flex space-x-2">
                          <div className="flex w-full space-x-1">
                            <span className="font-semibold text-[13px] leading-[16px] overflow-hidden text-[#d4d4d8]">
                              {stat.value}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
