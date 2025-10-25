"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, AreaSeries } from "lightweight-charts";

interface DataPoint {
  time: string;
  value: number;
}

const TIME_RANGES = ["24H", "7D", "30D", "3M", "1Y", "ALL"];

export default function PortfolioDetailedChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const [selectedRange, setSelectedRange] = useState("30D");
  const [currentValue, setCurrentValue] = useState(0);
  const [change, setChange] = useState({ value: 0, percentage: 0 });

  // Generate more detailed dummy data
  const generateData = (range: string): DataPoint[] => {
    const now = new Date();
    let dataPoints: DataPoint[] = [];
    let startValue = 90000;
    let intervals = 0;
    let timeInterval = 0;

    switch (range) {
      case "24H":
        intervals = 24;
        timeInterval = 60 * 60 * 1000; // hourly
        break;
      case "7D":
        intervals = 7 * 24;
        timeInterval = 60 * 60 * 1000; // hourly
        break;
      case "30D":
        intervals = 30;
        timeInterval = 24 * 60 * 60 * 1000; // daily
        break;
      case "3M":
        intervals = 90;
        timeInterval = 24 * 60 * 60 * 1000; // daily
        break;
      case "1Y":
        intervals = 365;
        timeInterval = 24 * 60 * 60 * 1000; // daily
        break;
      case "ALL":
        intervals = 730;
        timeInterval = 24 * 60 * 60 * 1000; // daily
        break;
      default:
        intervals = 30;
        timeInterval = 24 * 60 * 60 * 1000;
    }

    for (let i = intervals; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * timeInterval);
      const randomChange = (Math.random() - 0.48) * 0.02;
      startValue = Math.max(85000, Math.min(160000, startValue * (1 + randomChange)));
      
      // For hourly data (24H, 7D), use Unix timestamp in seconds
      // For daily data (30D+), use date string
      const isHourly = timeInterval < 24 * 60 * 60 * 1000;
      
      dataPoints.push({
        time: isHourly 
          ? (Math.floor(timestamp.getTime() / 1000) as any)
          : (timestamp.toISOString().split("T")[0] as any),
        value: startValue,
      });
    }

    return dataPoints;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#71717a",
      },
      width: chartContainerRef.current.clientWidth,
      height: 240,
      grid: {
        vertLines: { color: "rgba(39, 39, 42, 0.3)" },
        horzLines: { color: "rgba(39, 39, 42, 0.3)" },
      },
      rightPriceScale: {
        borderColor: "rgba(39, 39, 42, 0.3)",
      },
      timeScale: {
        borderColor: "rgba(39, 39, 42, 0.3)",
        timeVisible: true,
      },
      crosshair: {
        mode: 1,
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
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "#34cb88",
      topColor: "rgba(52, 203, 136, 0.4)",
      bottomColor: "rgba(52, 203, 136, 0.0)",
      lineWidth: 3,
    });

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;

    const data = generateData(selectedRange);
    seriesRef.current.setData(data);

    if (data.length > 0) {
      const lastValue = data[data.length - 1].value;
      const firstValue = data[0].value;
      const changeValue = lastValue - firstValue;
      const changePercentage = (changeValue / firstValue) * 100;
      
      setCurrentValue(lastValue);
      setChange({ value: changeValue, percentage: changePercentage });
    }

    chartRef.current?.timeScale().fitContent();
  }, [selectedRange]);

  return (
    <div className="h-full flex flex-col p-5">
      {/* Header with Value and Stats */}
      <div className="mb-4">
        <div className="flex items-baseline gap-4 mb-1">
          <span className="text-white text-4xl font-cabinet-bold">
            ${currentValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-cabinet-medium ${
              change.value >= 0 ? "text-brand-green" : "text-red-500"
            }`}>
              {change.value >= 0 ? "+" : ""}${change.value.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className={`text-sm font-cabinet-regular ${
              change.percentage >= 0 ? "text-brand-green" : "text-red-500"
            }`}>
              ({change.percentage >= 0 ? "+" : ""}{change.percentage.toFixed(2)}%)
            </span>
          </div>
        </div>
        <span className="text-zinc-400 text-sm font-cabinet-regular">
          Portfolio Value
        </span>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-3">
        {TIME_RANGES.map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`px-3 py-1.5 rounded-xl text-sm font-cabinet-medium transition-colors ${
              selectedRange === range
                ? "bg-brand-green text-white"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="flex-1" />
    </div>
  );
}
