import React from "react";

const Features = () => {
  return (
    <div className="w-full px-10 xl:px-40 my-40 flex flex-col gap-10 lg:gap-20">
      <div className="font-cabinet-bold text-center w-full h-fit text-3xl md:text-4xl lg:text-5xl">
        Next-Gen Creator Economy: Unleash the Future
      </div>
      {/* Bento Grid Container - 6 rows x 6 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 lg:gap-6 auto-rows-[180px]">
        {/* Grid 1 - 2 rows x 4 cols */}
        <div className="lg:col-span-4 lg:row-span-2 rounded-3xl p-8 flex items-center justify-center bg-none border-2 border-zinc-800">
          <div className="flex flex-col items-center max-w-[300px] gap-5">
            <div className="font-cabinet-bold text-2xl">
              Fan-Driven Growth
            </div>
            <div className="font-quicksand font-medium text-sm text-center">
              Powered by Rust, our trading engine delivers sub-100ms transaction speeds.
            </div>
          </div>
          <img src="/fan-driven-growth.png" alt="" className="h-[400px]" />
        </div>

        {/* Grid 2 - 2 rows x 2 cols */}
        <div className="lg:col-span-2 lg:row-span-2 rounded-3xl p-8 flex flex-col items-center justify-between bg-none border-2 border-zinc-800">
          <div className="flex flex-col items-center">
            <div className="font-cabinet-bold text-2xl">
              Lightning-Fast Trading Engine
            </div>
            <div className="font-quicksand font-medium text-sm text-center">
              Powered by Rust, our trading engine delivers sub-100ms transaction speeds.
            </div>
          </div>
          <img src="/fast-trading.png" alt="" className="h-[200px]" />
        </div>

        {/* Grid 3 - 3 rows x 2 cols */}
        <div className="lg:col-span-2 lg:row-span-3 rounded-3xl px-8 py-14 flex flex-col items-center justify-between bg-none border-2 border-zinc-800">
          <img src="/community.png" alt="" className="h-[350px]" />
          <div className="flex flex-col items-center">
            <div className="font-cabinet-bold text-2xl">
              Global Creator Marketplace
            </div>
            <div className="font-quicksand font-medium text-sm text-center">
              Connect with a worldwide community to invest in or grow your
              creative empire.
            </div>
          </div>
        </div>

        {/* Grid 4 - 2 rows x 2 cols */}
        <div className="lg:col-span-2 lg:row-span-2 p-8 rounded-3xl flex flex-col items-center justify-between py-10 bg-none border-2 border-zinc-800">
          <div className="flex flex-col items-center">
            <div className="font-cabinet-bold text-2xl">
              Secure Blockchain Platform
            </div>
            <div className="font-quicksand font-medium text-sm text-center">
              Trade and create with confidence on a 2FA-protected, transparent
              blockchain.
            </div>
          </div>
          <img src="/security.png" alt="" className="h-[200px]" />
        </div>

        {/* Grid 5 - 4 rows x 2 cols */}
        <div className="lg:col-span-2 lg:row-span-4 rounded-3xl px-8 flex flex-col items-center justify-between py-20 bg-none border-2 border-zinc-800">
          <div className="flex flex-col items-center">
            <div className="font-cabinet-bold text-2xl">
              Real-Time Token Trading
            </div>
            <div className="font-quicksand font-medium text-sm text-center">
              Build wealth by trading creator tokens as their influence
              skyrockets.
            </div>
          </div>
          <img src="/coins-person.png" alt="" className="h-[500px]" />
        </div>

        {/* Grid 6 - 1 row x 2 cols */}
        <div className="lg:col-span-2 lg:row-span-2 rounded-3xl p-8 flex flex-col items-center justify-center bg-none border-2 border-zinc-800">
          <img src="/funding.png" alt="" className="h-[250px]" />
          <div className="font-cabinet-bold text-2xl text-center">
            Instant funding for creators as they launch their tokens
          </div>
        </div>

        {/* Grid 7 - 2 rows x 2 cols */}
        <div className="lg:col-span-2 lg:row-span-1 rounded-3xl p-8 flex items-center justify-center bg-none border-2 border-zinc-800">
          <div className="font-cabinet-bold text-2xl">
            Seamless Wallet Integration
          </div>
          <img src="/wallet.png" alt="" className="h-[200px]" />
        </div>
      </div>
    </div>
  );
};

export default Features;
