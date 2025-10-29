"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MarketBar } from "@/components/trade/MarketBar";
import { TradeView } from "@/components/trade/TradeView";
import { Depth } from "@/components/trade/Depth";
import { TradeList } from "@/components/trade/TradeList";
import { OrderForm } from "@/components/trade/OrderForm";
import { OpenOrders } from "@/components/trade/OpenOrders";
import { OrderHistory } from "@/components/trade/OrderHistory";

export default function TradePage() {
  const params = useParams();
  const market = params.market as string;
  const [currentPrice, setCurrentPrice] = useState<number>(148.5);
  const [activeTab, setActiveTab] = useState<string>("orders");

  const tabs = [
    { id: "orders", label: "Open Orders" },
    { id: "order-history", label: "Order History" },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Market Bar */}
        <div className="shrink-0">
          <MarketBar market={market} />
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left side: Chart */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chart - Takes remaining space */}
            <div className="flex-1 overflow-hidden">
              <TradeView market={market} onPriceUpdate={setCurrentPrice} />
            </div>
            
            {/* Bottom Tabs Section */}
            <div className="h-[280px] flex flex-col border-t border-zinc-800">
              {/* Tab Headers */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                      activeTab === tab.id
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-4">
                {activeTab === "orders" && <OpenOrders market={market} />}
                {activeTab === "order-history" && <OrderHistory market={market} />}
              </div>
            </div>
          </div>

          {/* Middle: Order Book and Trades */}
          <div className="w-[350px] flex flex-col overflow-hidden border-l border-zinc-800">
            <div className="flex-1 overflow-hidden border-b border-zinc-800">
              <Depth market={market} />
            </div>
            <div className="flex-1 overflow-hidden">
              <TradeList market={market} />
            </div>
          </div>

          {/* Right side: Order Form */}
          <div className="w-[380px] border-l border-zinc-800 overflow-auto">
            <OrderForm market={market} currentPrice={currentPrice} />
          </div>
        </div>
      </div>
    </div>
  );
}
