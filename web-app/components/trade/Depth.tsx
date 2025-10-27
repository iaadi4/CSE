"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { getDepth } from "@/lib/httpClient";
import { SignalingManager } from "@/lib/SignalingManager";

interface DepthProps {
  market: string;
}

export function Depth({ market }: DepthProps) {
  const [bids, setBids] = useState<[string, string][]>([]);
  const [asks, setAsks] = useState<[string, string][]>([]);
  const asksContainerRef = useRef<HTMLDivElement>(null);
  const bidsContainerRef = useRef<HTMLDivElement>(null);

  // Scroll asks to bottom (closest to spread) whenever they update
  useEffect(() => {
    if (asksContainerRef.current) {
      asksContainerRef.current.scrollTop = asksContainerRef.current.scrollHeight;
    }
  }, [asks]);

  // Bids are already at top (closest to spread) by default, so no scrolling needed

  useEffect(() => {
    // Fetch initial depth data
    getDepth(market)
      .then((d) => {
        setBids(d.bids.reverse().slice(0, 15));
        setAsks(d.asks.slice(0, 15));
      })
      .catch(console.error);

    // Register WebSocket callback for real-time depth updates
    SignalingManager.getInstance().registerCallback(
      "depth",
      (data: any) => {
        console.log("Depth update received:", data);
        
        // Replace the entire orderbook with the new snapshot
        if (data.bids && data.bids.length > 0) {
          setBids(data.bids.slice(0, 15));
        }
        if (data.asks && data.asks.length > 0) {
          setAsks(data.asks.slice(0, 15));
        }
      },
      `DEPTH-${market}`
    );

    // Subscribe to depth updates
    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`depth.${market}`],
    });

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth.${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback("depth", `DEPTH-${market}`);
    };
  }, [market]);

  return (
    <div className="flex flex-col h-full bg-zinc-900/30">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-cabinet-bold text-white">Order Book</h3>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between px-4 py-2 text-xs text-zinc-400 font-cabinet-medium border-b border-zinc-800/50">
          <div className="flex-1 text-left">Price</div>
          <div className="flex-1 text-right">Size</div>
          <div className="flex-1 text-right">Total</div>
        </div>

        {/* Asks (Sell orders) */}
        <div ref={asksContainerRef} className="flex-1 overflow-y-auto">
          <AskTable asks={asks} />
        </div>

        {/* Spread */}
        <div className="py-2 px-4 bg-zinc-800/30 border-y border-zinc-800">
          <div className="text-xs text-zinc-400 font-cabinet-medium">
            Spread:{" "}
            {asks.length > 0 && bids.length > 0
              ? (parseFloat(asks[asks.length - 1][0]) - parseFloat(bids[0][0])).toFixed(2)
              : "—"}
          </div>
        </div>

        {/* Bids (Buy orders) */}
        <div ref={bidsContainerRef} className="flex-1 overflow-y-auto">
          <BidTable bids={bids} />
        </div>
      </div>
    </div>
  );
}

function AskTable({ asks }: { asks: [string, string][] }) {
  // Memoize calculations to prevent recalculating on every render
  const asksWithTotal = useMemo(() => {
    // For asks: we want cumulative to grow from top to bottom visually
    // Since asks are in reverse order visually (flex-col-reverse),
    // we need to calculate cumulative from start to end of the array
    // so that index 0 (visually at bottom) has the largest cumulative
    let cumulative = 0;
    return asks.map(([price, quantity]) => {
      cumulative += parseFloat(quantity);
      return { price, quantity, total: cumulative };
    });
  }, [asks]);

  const { maxTotal, maxQuantity } = useMemo(() => ({
    maxTotal: asksWithTotal.length > 0 ? asksWithTotal[asksWithTotal.length - 1].total : 1,
    maxQuantity: Math.max(...asks.map((a) => parseFloat(a[1])), 1)
  }), [asks, asksWithTotal]);

  return (
    <div className="flex flex-col-reverse gap-0.5">
      {asksWithTotal.map(({ price, quantity, total }, index) => {
        const priceNum = parseFloat(price);
        const quantityNum = parseFloat(quantity);
        
        return (
          <div
            key={index}
            className="flex justify-between px-4 py-1 text-xs font-cabinet-medium hover:bg-zinc-800/30 relative"
          >
            {/* Background bar for cumulative total (dimmer) */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#43262C] will-change-[width]"
              style={{
                width: `${(total / maxTotal) * 100}%`,
                transition: 'width 300ms ease-out',
              }}
            />
            
            {/* Foreground bar for individual size (brighter) */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#7E3136] will-change-[width]"
              style={{
                width: `${(quantityNum / maxQuantity) * 100}%`,
                transition: 'width 300ms ease-out',
              }}
            />
            
            <div className="flex-1 text-left text-red-400 relative z-10">{priceNum.toFixed(2)}</div>
            <div className="flex-1 text-right text-zinc-300 relative z-10">{quantityNum.toFixed(4)}</div>
            <div className="flex-1 text-right text-zinc-400 relative z-10">{total.toFixed(4)}</div>
          </div>
        );
      })}
    </div>
  );
}

function BidTable({ bids }: { bids: [string, string][] }) {
  // Memoize calculations to prevent recalculating on every render
  const bidsWithTotal = useMemo(() => {
    // Since we display with flex-col-reverse, we need to calculate cumulative
    // from end to start so visually it grows downward (toward the spread)
    let cumulative = 0;
    const reversed = [...bids].reverse();
    return reversed.map(([price, quantity]) => {
      cumulative += parseFloat(quantity);
      return { price, quantity, total: cumulative };
    }).reverse();
  }, [bids]);

  const { maxTotal, maxQuantity } = useMemo(() => {
    const totals = bidsWithTotal.map(b => b.total);
    return {
      maxTotal: Math.max(...totals, 1),
      maxQuantity: Math.max(...bids.map((b) => parseFloat(b[1])), 1)
    };
  }, [bids, bidsWithTotal]);

  return (
    <div className="flex flex-col-reverse gap-0.5">
      {bidsWithTotal.map(({ price, quantity, total }, index) => {
        const priceNum = parseFloat(price);
        const quantityNum = parseFloat(quantity);
        
        return (
          <div
            key={index}
            className="flex justify-between px-4 py-1 text-xs font-cabinet-medium hover:bg-zinc-800/30 relative"
          >
            {/* Background bar for cumulative total (dimmer) */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#164635] will-change-[width]"
              style={{
                width: `${(total / maxTotal) * 100}%`,
                transition: 'width 300ms ease-out',
              }}
            />
            
            {/* Foreground bar for individual size (brighter) */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#137252] will-change-[width]"
              style={{
                width: `${(quantityNum / maxQuantity) * 100}%`,
                transition: 'width 300ms ease-out',
              }}
            />
            
            <div className="flex-1 text-left text-brand-green relative z-10">{priceNum.toFixed(2)}</div>
            <div className="flex-1 text-right text-zinc-300 relative z-10">{quantityNum.toFixed(4)}</div>
            <div className="flex-1 text-right text-zinc-400 relative z-10">{total.toFixed(4)}</div>
          </div>
        );
      })}
    </div>
  );
}
