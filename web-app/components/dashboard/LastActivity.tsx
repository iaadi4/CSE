"use client";

import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

interface ActivityItem {
  title: string;
  subtitle: string;
  timestamp: string;
  type: "login" | "logout";
}

const ACTIVITY_DATA: ActivityItem[] = [
  {
    title: "New device logged in",
    subtitle: "Ubuntu 2 (New 196.168.1.CRA)",
    timestamp: "12-12-2025 15:45",
    type: "login",
  },
  {
    title: "New device logged in",
    subtitle: "Ubuntu 2 (New 196.168.1.CRA)",
    timestamp: "12-12-2025 15:45",
    type: "login",
  },
];

export default function LastActivity() {
  return (
    <div className="h-full flex flex-col p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-lg font-cabinet-bold">Last Activity</h2>
      </div>

      {/* Activity List */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {ACTIVITY_DATA.map((activity, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 hover:bg-zinc-900/70 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-sm font-cabinet-medium ${
                activity.type === "login" ? "text-red-500" : "text-green-500"
              }`}>
                {activity.title}
              </span>
              <span className="text-xs text-zinc-500 font-cabinet-regular">
                {activity.timestamp}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-cabinet-regular">
              {activity.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
