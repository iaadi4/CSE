"use client";

import { useEffect, useRef } from "react";

interface PriceChartProps {
  trades: Array<{
    price: string;
    timestamp: number;
  }>;
}

export const PriceChart = ({ trades }: PriceChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || trades.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, width, height);

    // Get price data
    const prices = trades.map((t) => parseFloat(t.price));
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Draw grid
    ctx.strokeStyle = "#262626";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw price labels
    ctx.fillStyle = "#a3a3a3";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const price = maxPrice - (priceRange / 5) * i;
      const y = (height / 5) * i;
      ctx.fillText(price.toFixed(2), width - 10, y + 15);
    }

    // Draw area chart
    if (trades.length > 1) {
      const points: Array<{ x: number; y: number }> = [];
      const stepX = width / Math.max(trades.length - 1, 1);

      trades.forEach((trade, i) => {
        const x = i * stepX;
        const normalizedPrice = (parseFloat(trade.price) - minPrice) / priceRange;
        const y = height - normalizedPrice * height;
        points.push({ x, y });
      });

      // Draw gradient area
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(52, 203, 136, 0.4)");
      gradient.addColorStop(1, "rgba(52, 203, 136, 0.0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(points[0].x, height);
      points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.lineTo(points[points.length - 1].x, height);
      ctx.closePath();
      ctx.fill();

      // Draw line
      ctx.strokeStyle = "#34cb88";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      // Draw current price line
      const lastPoint = points[points.length - 1];
      ctx.strokeStyle = "#34cb88";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, lastPoint.y);
      ctx.lineTo(width, lastPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw current price label
      const currentPrice = parseFloat(trades[trades.length - 1].price);
      ctx.fillStyle = "#34cb88";
      ctx.fillRect(width - 80, lastPoint.y - 10, 70, 20);
      ctx.fillStyle = "#121212";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`$${currentPrice.toFixed(2)}`, width - 45, lastPoint.y + 4);
    }
  }, [trades]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
};
