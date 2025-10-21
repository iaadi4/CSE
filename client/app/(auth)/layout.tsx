import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh w-dvw flex">
      {/* Left section - Dynamic content from children */}
      <div className="w-1/2 h-full flex flex-col items-center justify-center gap-20">
        {children}
      </div>

      {/* Right section - Shared across auth pages */}
      <div className="w-1/2 h-full p-20">
        <div className="h-full w-full rounded-xl bg-[#F6FAF4] flex flex-col items-center justify-between p-20">
          <img src="/login_page.png" alt="Creator Stock Exchange" />
          <div className="font-cabinet-medium text-4xl text-center px-10">
            Join us in building the world&apos;s first marketplace for creator
            equity
          </div>
        </div>
      </div>
    </div>
  );
}
