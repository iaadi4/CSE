"use client";

import { useEffect } from "react";
import { MarketBar } from "@/components/trade/MarketBar";
import { TradeInterface } from "@/components/trade/TradeInterface";
import { SwapInterface } from "@/components/trade/SwapInterface";
import { TradesProvider } from "@/providers/TradesProvider";

export default function TradePage() {
  const market = "SOL_USDC"; // Default market

  useEffect(() => {
    // Initialize any required data or websocket connections
  }, []);

  return (
    <TradesProvider>
      <div className="bg-[#090909] min-h-screen">
        <div className="grid grid-rows-[60px_1fr] p-4 sm:p-5 min-h-screen gap-2">
          {/* Top Bar */}
          <div className="grid grid-cols-1 gap-2">
            <MarketBar market={market} />
          </div>

          {/* Main Trading Area */}
          <div className="grid grid-cols-1 lg:grid-cols-[4fr_1fr] gap-2 mt-5 lg:mt-0">
            {/* Chart and Order Book */}
            <div className="order-2 lg:order-1">
              <TradeInterface market={market} />
            </div>

            {/* Buy/Sell Interface */}
            <div className="order-1 lg:order-2">
              <SwapInterface market={market} />
            </div>
          </div>
        </div>
      </div>
    </TradesProvider>
  );
}
