"use client";

import { OrderBook } from "./OrderBook";
import { TradeView } from "./TradeView";

export const TradeInterface = ({ market }: { market: string }) => {
  return (
    <div className="grid grid-rows-[600px_1fr] grid-cols-1 md:grid-cols-[3fr_1fr] gap-2">
      <TradeView market={market} />
      <OrderBook market={market} />
    </div>
  );
};
