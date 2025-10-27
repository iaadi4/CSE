"use client";

import { useEffect, useRef, useState } from "react";
import { getKlines } from "@/lib/httpClient";
import { KLine } from "@/lib/types";
import {
  CandlestickSeries,
  ColorType,
  createChart as createLightWeightChart,
  CrosshairMode,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";
import { SignalingManager } from "@/lib/SignalingManager";

const timeOptions = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
];

export const TradeView = ({ market }: { market: string }) => {
  const [selectedInterval, setSelectedInterval] = useState("1h");
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const currentCandleRef = useRef<any>(null);
  const intervalTimerRef = useRef<any>(null);

  // Convert interval to seconds
  const getIntervalSeconds = (interval: string): number => {
    const match = interval.match(/^(\d+)([mhd])$/);
    if (!match) return 3600; // default 1h
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  };

  useEffect(() => {
    if (!chartRef.current) return;

    let isMounted = true;

    const initChart = async () => {
      // Fetch KLine data
      let klineData: KLine[] = [];
      try {
        const endTime = Math.floor(new Date().getTime() / 1000);
        const startTime = endTime - 7 * 24 * 60 * 60; // 7 days ago
        klineData = await getKlines(market, selectedInterval, startTime, endTime);
      } catch (e) {
        console.error("Failed to fetch klines:", e);
      }

      // Check if component is still mounted
      if (!isMounted) return;

      // Clear existing chart
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.remove();
        } catch (e) {
          console.error("Error removing chart:", e);
        }
        chartInstanceRef.current = null;
        candleSeriesRef.current = null;
      }

      // Check again if component is still mounted and ref exists
      if (!isMounted || !chartRef.current) return;

      // Create new chart
      const chart = createLightWeightChart(chartRef.current, {
        autoSize: true,
        layout: {
          background: {
            type: ColorType.Solid,
            color: "#09090B", // zinc-950
          },
          textColor: "#71717a", // zinc-500
        },
        grid: {
          vertLines: {
            color: "rgba(39, 39, 42, 0.3)",
            visible: true,
          },
          horzLines: {
            color: "rgba(39, 39, 42, 0.3)",
            visible: true,
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            width: 1,
            color: "#34cb88",
            style: 0,
          },
          horzLine: {
            width: 1,
            color: "#34cb88",
            style: 0,
          },
        },
        rightPriceScale: {
          borderColor: "rgba(39, 39, 42, 0.3)",
          visible: true,
        },
        timeScale: {
          borderColor: "rgba(39, 39, 42, 0.3)",
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#34cb88",
        downColor: "#ef4444",
        borderVisible: false,
        wickUpColor: "#34cb88",
        wickDownColor: "#ef4444",
      });

      // Set data
      const formattedData = klineData
        .map((kline) => {
          const time = parseInt(kline.end) / 1000;
          const open = parseFloat(kline.open);
          const high = parseFloat(kline.high);
          const low = parseFloat(kline.low);
          const close = parseFloat(kline.close);
          
          // Skip invalid data
          if (isNaN(time) || time <= 0 || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
            return null;
          }
          
          return {
            time: time as UTCTimestamp,
            open,
            high,
            low,
            close,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => a.time - b.time); // Ensure ascending order

      if (formattedData.length > 0) {
        candlestickSeries.setData(formattedData);
      }

      chartInstanceRef.current = chart;
      candleSeriesRef.current = candlestickSeries;

      // Initialize current candle ref with the last candle
      if (formattedData.length > 0) {
        currentCandleRef.current = { ...formattedData[formattedData.length - 1] };
      }

      // Fit content
      chart.timeScale().fitContent();
    };

    initChart();

    return () => {
      isMounted = false;
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.remove();
        } catch (e) {
          // Ignore errors during cleanup
          console.error("Error during chart cleanup:", e);
        }
        chartInstanceRef.current = null;
        candleSeriesRef.current = null;
        currentCandleRef.current = null;
      }
    };
  }, [market, selectedInterval]);

  // Real-time updates via WebSocket
  useEffect(() => {
    const intervalSeconds = getIntervalSeconds(selectedInterval);
    
    // Subscribe to trades
    const sm = SignalingManager.getInstance();
    
    const handleTrade = (trade: any) => {
      if (!candleSeriesRef.current || !currentCandleRef.current) return;

      const tradePrice = parseFloat(trade.price);
      const tradeTime = Math.floor(trade.timestamp / 1000);
      
      // Calculate the start time of the current candle
      const candleStartTime = Math.floor(tradeTime / intervalSeconds) * intervalSeconds;
      
      // Check if we need to start a new candle
      if (candleStartTime !== currentCandleRef.current.time) {
        // New candle period - create a new candle
        currentCandleRef.current = {
          time: candleStartTime as UTCTimestamp,
          open: tradePrice,
          high: tradePrice,
          low: tradePrice,
          close: tradePrice,
        };
      } else {
        // Update current candle
        currentCandleRef.current.close = tradePrice;
        currentCandleRef.current.high = Math.max(currentCandleRef.current.high, tradePrice);
        currentCandleRef.current.low = Math.min(currentCandleRef.current.low, tradePrice);
      }
      
      // Update the chart
      try {
        candleSeriesRef.current.update(currentCandleRef.current);
      } catch (e) {
        console.error("Error updating candle:", e);
      }
    };

    sm.registerCallback("trade", handleTrade, `CHART-${market}`);
    sm.sendMessage({
      method: "SUBSCRIBE",
      params: [`trade.${market}`],
    });

    return () => {
      sm.deRegisterCallback("trade", `CHART-${market}`);
      sm.sendMessage({
        method: "UNSUBSCRIBE",
        params: [`trade.${market}`],
      });
    };
  }, [market, selectedInterval]);

  return (
    <div className="h-full bg-zinc-900/30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800">
        <h3 className="text-sm font-cabinet-bold text-white">{market.replace("_", " / ")}</h3>
        
        {/* Time interval selector */}
        <div className="flex gap-2">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              className={`px-3 py-1 rounded-lg text-xs font-cabinet-medium transition-colors ${
                selectedInterval === option.value
                  ? "bg-brand-green text-white"
                  : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800"
              }`}
              onClick={() => setSelectedInterval(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="flex-1" />
    </div>
  );
};
