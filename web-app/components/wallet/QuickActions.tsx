"use client";

import { useState } from "react";
import { BiTransferAlt } from "react-icons/bi";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { RiExchangeFill } from "react-icons/ri";
import DepositDialog from "./dialogs/DepositDialog";
import WithdrawDialog from "./dialogs/WithdrawDialog";
import TransferDialog from "./dialogs/TransferDialog";
import SwapDialog from "./dialogs/SwapDialog";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  action: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Deposit",
    icon: <FaArrowDown />,
    bgColor: "bg-brand-green/20",
    iconColor: "text-brand-green",
    action: "deposit",
  },
  {
    label: "Withdraw",
    icon: <FaArrowUp />,
    bgColor: "bg-red-500/20",
    iconColor: "text-red-500",
    action: "withdraw",
  },
  {
    label: "Transfer",
    icon: <BiTransferAlt />,
    bgColor: "bg-blue-500/20",
    iconColor: "text-blue-500",
    action: "transfer",
  },
  {
    label: "Swap",
    icon: <RiExchangeFill />,
    bgColor: "bg-purple-500/20",
    iconColor: "text-purple-500",
    action: "swap",
  },
];

export default function QuickActions() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const handleActionClick = (action: string) => {
    setOpenDialog(action);
  };

  const closeDialog = () => {
    setOpenDialog(null);
  };

  return (
    <>
      <div className="h-full flex flex-col p-6">
        <h2 className="text-white text-2xl font-cabinet-bold mb-5">Quick Actions</h2>

        <div className="grid grid-cols-2 gap-4 flex-1">
          {QUICK_ACTIONS.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action.action)}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 hover:bg-zinc-900/70 transition-colors flex flex-col items-center justify-center gap-4 group"
            >
              <div className={`w-16 h-16 rounded-full ${action.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <div className={`text-2xl ${action.iconColor}`}>
                  {action.icon}
                </div>
              </div>
              <span className="text-white text-lg font-cabinet-medium">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <DepositDialog isOpen={openDialog === "deposit"} onClose={closeDialog} />
      <WithdrawDialog isOpen={openDialog === "withdraw"} onClose={closeDialog} />
      <TransferDialog isOpen={openDialog === "transfer"} onClose={closeDialog} />
      <SwapDialog isOpen={openDialog === "swap"} onClose={closeDialog} />
    </>
  );
}
