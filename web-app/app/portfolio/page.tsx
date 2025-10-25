"use client";

import Sidebar from "@/components/layout/Sidebar";
import PortfolioDetailedChart from "@/components/portfolio/PortfolioDetailedChart";
import AssetAllocation from "@/components/portfolio/AssetAllocation";
import PortfolioMetrics from "@/components/portfolio/PortfolioMetrics";
import TradeHistory from "@/components/portfolio/TradeHistory";

const PortfolioPage = () => {
  return (
    <div className="h-dvh w-dvw bg-zinc-950 flex">
      <Sidebar />

      <div className="w-[82%] h-full p-5">
        <div
          className="rounded-4xl h-full w-full p-5"
          style={{
            background:
              "linear-gradient(315deg, rgba(29, 57, 48, 1) 0%, rgba(18, 47, 39, 0.8) 5%, rgba(12, 28, 24, 0.5) 20%, transparent 35%)",
          }}
        >
          {/* Top Section - Detailed Chart */}
          <div className="w-full h-[43%] mb-5">
            <div
              className="border border-zinc-800 rounded-4xl h-full overflow-hidden"
              style={{
                background:
                  "linear-gradient(23deg, rgba(29, 57, 48, 1) 0%, rgba(18, 47, 39, 0.8) 5%, rgba(12, 28, 24, 0.5) 20%, transparent 35%)",
              }}
            >
              <PortfolioDetailedChart />
            </div>
          </div>

          {/* Middle Section - Metrics */}
          <div className="w-full h-[22%] mb-5">
            <div className="border border-zinc-800 rounded-4xl h-full overflow-hidden">
              <PortfolioMetrics />
            </div>
          </div>

          {/* Bottom Section - Asset Allocation and Trade History */}
          <div className="w-full h-[30%] flex gap-5">
            <div className="w-[50%] border border-zinc-800 rounded-4xl overflow-hidden">
              <AssetAllocation />
            </div>
            <div className="w-[50%] border border-zinc-800 rounded-4xl overflow-hidden">
              <TradeHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
