"use client";

import Sidebar from "@/components/layout/Sidebar";
import WalletBalances from "@/components/wallet/WalletBalances";
import QuickActions from "@/components/wallet/QuickActions";
import RecentTransactions from "@/components/wallet/RecentTransactions";

const WalletPage = () => {
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
          {/* Top Section - Wallet Balances and Quick Actions */}
          <div className="w-full flex gap-5 h-[50%] mb-5">
            <div className="w-[60%] border border-zinc-800 rounded-4xl"
              style={{
                background:
                  "linear-gradient(23deg, rgba(29, 57, 48, 1) 0%, rgba(18, 47, 39, 0.8) 5%, rgba(12, 28, 24, 0.5) 20%, transparent 35%)",
              }}
            >
              <WalletBalances />
            </div>
            <div className="w-[40%] border border-zinc-800 rounded-4xl">
              <QuickActions />
            </div>
          </div>

          {/* Bottom Section - Recent Transactions */}
          <div className="w-full h-[47%]">
            <div className="border border-zinc-800 rounded-4xl h-full">
              <RecentTransactions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
