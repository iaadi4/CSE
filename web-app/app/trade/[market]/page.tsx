"use client";

import { useParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { MarketBar } from "@/components/trade/MarketBar";
import { TradeView } from "@/components/trade/TradeView";
import { Depth } from "@/components/trade/Depth";
import { TradeList } from "@/components/trade/TradeList";

export default function TradePage() {
  const params = useParams();
  const market = params.market as string;

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MarketBar market={market} />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left side: Chart */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <TradeView market={market} />
          </div>

          {/* Right side: Order book and trades */}
          <div className="w-[350px] flex flex-col overflow-hidden border-l border-zinc-800">
            <div className="flex-1 overflow-hidden border-b border-zinc-800">
              <Depth market={market} />
            </div>
            <div className="flex-1 overflow-hidden">
              <TradeList market={market} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
