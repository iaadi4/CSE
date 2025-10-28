"use client";

import { useState } from "react";
import { OrderBook } from "./OrderBook";
import { TradeView } from "./TradeView";
import { OrderForm } from "./OrderForm";
import { OpenOrders } from "./OpenOrders";

export const TradeInterface = ({ market }: { market: string }) => {
  const [currentPrice, setCurrentPrice] = useState<number>(148.5);

  return (
    <div className="flex flex-col gap-2">
      {/* Chart and Order Book */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-2" style={{ height: '400px' }}>
        <TradeView market={market} onPriceUpdate={setCurrentPrice} />
        <OrderBook market={market} />
      </div>
      
      {/* Order Form and Open Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <OrderForm market={market} currentPrice={currentPrice} />
        <OpenOrders market={market} />
      </div>
    </div>
  );
};
