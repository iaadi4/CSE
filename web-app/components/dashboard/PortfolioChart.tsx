"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  LineSeries,
} from "lightweight-charts";

interface PortfolioChartProps {
  data?: Array<{ time: number; value: number }>;
}

type TimeRange = "24h" | "7d" | "30d" | "ytd";

export default function PortfolioChart({ data }: PortfolioChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const allDataRef = useRef<Array<{ time: number; value: number }>>([]);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("24h");
  const [currentValue, setCurrentValue] = useState<number>(123800);

  // Generate all data once
  useEffect(() => {
    if (data) {
      allDataRef.current = data;
    } else {
      // Generate dummy data for 35 days (a bit more than a month)
      const now = new Date();
      const daysToGenerate = 35;
      const hoursToGenerate = daysToGenerate * 24;

      let currentValue = 123800;

      allDataRef.current = Array.from({ length: hoursToGenerate }, (_, i) => {
        // Random walk: change by -2% to +2% each hour
        const percentChange = (Math.random() - 0.5) * 0.04;
        currentValue = currentValue * (1 + percentChange);

        // Keep value within reasonable bounds (90k to 160k)
        currentValue = Math.max(90000, Math.min(160000, currentValue));

        const date = new Date(
          now.getTime() - (hoursToGenerate - i - 1) * 60 * 60 * 1000
        );

        return {
          time: Math.floor(date.getTime() / 1000),
          value: Math.round(currentValue * 100) / 100,
        };
      });
    }
  }, [data]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#71717a",
      },
      grid: {
        vertLines: { color: "rgba(39, 39, 42, 0.3)" },
        horzLines: { color: "rgba(39, 39, 42, 0.3)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      rightPriceScale: {
        borderColor: "#27272a",
      },
      timeScale: {
        borderColor: "#27272a",
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    // Create line series
    const lineSeries = chart.addSeries(LineSeries, {
      color: "#34cb88",
      lineWidth: 3,
    });

    seriesRef.current = lineSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data when range changes
  useEffect(() => {
    if (!seriesRef.current || allDataRef.current.length === 0) return;

    const now = Math.floor(Date.now() / 1000);
    let cutoffTime: number;

    switch (selectedRange) {
      case "24h":
        cutoffTime = now - 24 * 60 * 60;
        break;
      case "7d":
        cutoffTime = now - 7 * 24 * 60 * 60;
        break;
      case "30d":
        cutoffTime = now - 30 * 24 * 60 * 60;
        break;
      case "ytd":
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        cutoffTime = Math.floor(startOfYear.getTime() / 1000);
        break;
    }

    // Filter data based on selected range, but only show what's available
    const filteredData = allDataRef.current.filter(
      (point) => point.time >= cutoffTime
    );

    seriesRef.current.setData(filteredData as any);
    chartRef.current?.timeScale().fitContent();
    
    // Update current value to the last data point
    if (filteredData.length > 0) {
      setCurrentValue(filteredData[filteredData.length - 1].value);
    }
  }, [selectedRange]);

  return (
    <div className="w-[70%] h-full flex flex-col p-5 border-r border-zinc-800">
      <div className="flex justify-between h-fit">
        <div className="flex flex-col">
          <div className="text-zinc-400 text-lg font-cabinet-medium">
            Total Asset Value
          </div>
          <div className="text-white text-4xl font-cabinet-bold">
            ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-base">USD</span>
          </div>
        </div>
        <div className="flex gap-2 bg-zinc-800 rounded-full h-fit">
          {(["24h", "7d", "30d", "ytd"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-5 h-fit py-2 cursor-pointer rounded-full text-xs font-cabinet-medium transition-colors ${
                selectedRange === range
                  ? "bg-linear-to-t from-zinc-700 to-transparent border border-zinc-500 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full flex-1 relative">
        <div 
          ref={chartContainerRef} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
