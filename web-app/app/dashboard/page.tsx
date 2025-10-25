"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { IoWallet } from "react-icons/io5";
import { FaChartLine, FaUserLarge } from "react-icons/fa6";
import { FaHistory } from "react-icons/fa";
import { FaAddressBook } from "react-icons/fa6";
import { RiSettings3Fill } from "react-icons/ri";
import PortfolioChart from "@/components/dashboard/PortfolioChart";
import PortfolioList from "@/components/dashboard/PortfolioList";
import StatsGrid from "@/components/dashboard/StatsGrid";
import MarketSnapshot from "@/components/dashboard/MarketSnapshot";
import LastActivity from "@/components/dashboard/LastActivity";
import TransactionHistory from "@/components/dashboard/TransactionHistory";

const SIDEBAR_ITEMS = [
  {
    icon: <TbLayoutDashboardFilled />,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: <FaChartLine />,
    label: "Market",
    href: "/market",
  },
  {
    icon: <IoWallet />,
    label: "Wallet",
    href: "/wallet",
  },
  {
    icon: <FaAddressBook />,
    label: "Portfolio",
    href: "/portfolio",
  },
  {
    icon: <FaHistory />,
    label: "Transactions",
    href: "/transactions",
  },
];

const OTHER_ITEMS = [
  {
    icon: <FaUserLarge />,
    label: "Profile",
    href: "/profile",
  },
  {
    icon: <RiSettings3Fill />,
    label: "Settings",
    href: "/settings",
  },
];

const page = () => {
  const pathname = usePathname();

  return (
    <div className="h-dvh w-dvw bg-zinc-950 flex">
      <div className="h-full w-[18%] px-10 flex flex-col">
        <div className="flex gap-5 py-10 px-5 items-center">
          <img src="/logo.png" alt="Logo" className="h-12" />
          <span className="text-white font-cabinet-black text-2xl tracking-wider">
            CSE
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-between pb-10">
          <div className="flex flex-col">
            {SIDEBAR_ITEMS.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-4 hover:text-zinc-200 font-cabinet-medium rounded-l-2xl text-lg py-3 pl-5 ${
                  pathname === item.href
                    ? "text-white bg-linear-to-r from-[#112F27] to-zinc-950"
                    : "text-zinc-400"
                }`}
              >
                <div className="text-lg">{item.icon}</div>
                <div>{item.label}</div>
              </Link>
            ))}
          </div>
          <div className="flex flex-col">
            {OTHER_ITEMS.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-4 hover:text-zinc-200 font-cabinet-medium rounded-l-2xl text-lg py-3 pl-5 ${
                  pathname === item.href
                    ? "text-white bg-linear-to-r from-[#112F27] to-zinc-950"
                    : "text-zinc-400"
                }`}
              >
                <div className="text-lg">{item.icon}</div>
                <div>{item.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[82%] h-full p-5">
        <div
          className="rounded-4xl h-full w-full p-5"
          style={{
            background:
              "linear-gradient(315deg, rgba(29, 57, 48, 1) 0%, rgba(18, 47, 39, 0.8) 5%, rgba(12, 28, 24, 0.5) 20%, transparent 35%)",
          }}
        >
          <div
            className="w-full flex rounded-4xl h-[40%] border border-zinc-800"
            style={{
              background:
                "linear-gradient(23deg, rgba(29, 57, 48, 1) 0%, rgba(18, 47, 39, 0.8) 5%, rgba(12, 28, 24, 0.5) 20%, transparent 35%)",
            }}
          >
            <PortfolioChart />
            <div className="w-[30%]">
              <StatsGrid />
            </div>
          </div>

          <div className="h-[60%] w-full flex">
            <div className="h-full w-[60%]">
              <div className="h-[60%] w-full pr-5 py-5">
                <div className="border h-full w-full border-zinc-800 rounded-4xl">
                  <MarketSnapshot />
                </div>
              </div>
              <div className="h-[40%] w-full pr-5 flex gap-5">
                <div className="h-full w-full border border-zinc-800 rounded-3xl">
                  <LastActivity />
                </div>
                <div className="h-full w-full border border-zinc-800 rounded-3xl">
                  <TransactionHistory />
                </div>
              </div>
            </div>
            <div className="h-full w-[40%] pt-5">
              <div className="border border-zinc-800 rounded-4xl h-full w-full">
                <PortfolioList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
