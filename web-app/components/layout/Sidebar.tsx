"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { IoWallet } from "react-icons/io5";
import { FaChartLine, FaUserLarge } from "react-icons/fa6";
import { FaHistory } from "react-icons/fa";
import { FaAddressBook } from "react-icons/fa6";
import { RiSettings3Fill } from "react-icons/ri";

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

export default function Sidebar() {
  const pathname = usePathname();

  return (
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
  );
}
