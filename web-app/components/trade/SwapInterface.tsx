"use client";

import { useState, useEffect } from "react";
import { createOrder } from "@/lib/exchange-api";
import { useTrades } from "@/providers/TradesProvider";

export const SwapInterface = ({ market }: { market: string }) => {
  const { price: currentPriceStr } = useTrades();
  const currentPrice = parseFloat(currentPriceStr) || 148.5;
  
  const [isBuyMode, setIsBuyMode] = useState(true);
  const [orderType, setOrderType] = useState("Limit");
  const [limitPrice, setLimitPrice] = useState(currentPrice);
  const [size, setSize] = useState("");
  const [maxUSD, setMaxUSD] = useState(0.0);
  const [fees, setFees] = useState(0.0);
  const [position, setPosition] = useState(0.0);

  // Update limit price when current price changes
  useEffect(() => {
    if (orderType === "Limit" && !size) {
      setLimitPrice(currentPrice);
    }
  }, [currentPrice, orderType, size]);

  useEffect(() => {
    const price = orderType === "Market" ? currentPrice : limitPrice;
    const calculatedValue = price * Number(size || 0);
    const calculatedFees = calculatedValue * 0.001; // 0.1% fees
    setMaxUSD(calculatedValue);
    setFees(calculatedFees);
    setPosition(Number(size || 0));
  }, [size, limitPrice, orderType, currentPrice]);

  const handleCreateOrder = async () => {
    const quantity = Number(size);

    if (!quantity || quantity <= 0) {
      alert("Please enter a valid size greater than zero.");
      return;
    }

    if (orderType === "Limit" && (limitPrice <= 0 || isNaN(limitPrice))) {
      alert("Please enter a valid limit price.");
      return;
    }

    const side = isBuyMode ? "BUY" : "SELL";
    const orderPrice = orderType === "Market" ? currentPrice : limitPrice;

    try {
      const userId = localStorage.getItem("exchange_user_id") || `user_${Date.now()}`;
      localStorage.setItem("exchange_user_id", userId);

      await createOrder({
        market,
        side: side as "BUY" | "SELL",
        quantity,
        price: orderPrice,
        userId,
      });
      
      alert("Order created successfully!");
      setSize("");
      setMaxUSD(0);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Check console for details.");
    }
  };

  return (
    <div className="h-fit lg:h-[600px]">
      <div className="h-full bg-[#121212] border-[#262626] rounded-lg border overflow-hidden">
        <div className="p-3 relative flex flex-col h-full overflow-auto justify-start">
          <div className="flex flex-col h-full justify-start">
            <div className="flex flex-col relative z-10">
              {/* Buy/Sell Toggle */}
              <div className="h-[40px] w-full inline-flex">
                <div
                  className={`flex items-center justify-center flex-1 h-full cursor-pointer border border-[#262626] rounded-l-xl ${
                    isBuyMode
                      ? "bg-[#04100a] text-[#34cb88]"
                      : "text-[#262626]"
                  }`}
                  onClick={() => setIsBuyMode(true)}
                >
                  <span>Buy</span>
                </div>
                <div
                  className={`flex items-center justify-center flex-1 h-full cursor-pointer border border-[#262626] rounded-r-xl ${
                    isBuyMode
                      ? "text-[#ff615c]"
                      : "bg-[#1e0c0b] text-[#ff615c]"
                  }`}
                  onClick={() => setIsBuyMode(false)}
                >
                  <span>Sell</span>
                </div>
              </div>

              <span className="shrink-0 w-full pb-4"></span>

              {/* Order Type */}
              <div className="flex items-end w-full justify-between space-x-2 mb-2">
                <div className="flex flex-col w-full">
                  <div className="text-[#a3a3a3] pointer-events-none select-none mt-0 mb-2">
                    <span className="font-semibold text-[12px] leading-[14px] tracking-[0.15px] mt-0">
                      Order Type
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      className="px-2 bg-[#262626] border-none focus:outline-none active:outline-none text-[#a3a3a3] hover:bg-[#171717] border flex items-center text-sm w-full h-8 rounded-lg"
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value)}
                    >
                      <option value="Limit" className="text-[#a3a3a3] text-[14px] px-2 py-1">
                        Limit
                      </option>
                      <option value="Market" className="text-[#a3a3a3] text-[14px] px-2 py-1">
                        Market
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Limit Price Input */}
              {orderType === "Limit" && (
                <div className="flex flex-col">
                  <div className="text-[#a3a3a3] pointer-events-none select-none mt-0 mb-2">
                    <span className="font-semibold text-[12px] leading-[14px] tracking-[0.15px] mt-0">
                      Limit Price
                    </span>
                  </div>
                  <div className="flex justify-center w-full relative h-8">
                    <div className="absolute w-full h-[32px] text-sm inline-flex">
                      <input
                        className="px-2 pt-0.5 w-full bg-[#262626] text-[#a3a3a3] focus:outline-none border-none h-full rounded-lg"
                        type="number"
                        step={0.01}
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(Number(e.target.value))}
                        style={{ paddingRight: "40px" }}
                      />
                      <div className="absolute top-0 flex items-center h-full space-x-1 right-3 z-1 select-none">
                        <span className="pointer-events-none mt-0.5 text-[#d4d4d8] text-xs">
                          USD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Market Price Display */}
              {orderType === "Market" && (
                <div className="flex flex-col">
                  <div className="text-[#a3a3a3] pointer-events-none select-none mt-0 mb-2">
                    <span className="font-semibold text-[12px] leading-[14px] tracking-[0.15px] mt-0">
                      Market Price
                    </span>
                  </div>
                  <div className="pointer-events-none text-sm bg-[#262626] rounded-lg w-full px-2 flex items-center text-[#d4d4d8] h-[32px] select-none">
                    Market Price
                  </div>
                </div>
              )}

              <span className="shrink-0 w-full pb-4"></span>

              {/* Size and USD Input */}
              <div className="flex items-end justify-between space-x-2">
                <div className="flex flex-col w-1/2">
                  <span className="font-semibold text-[12px] leading-[14px] tracking-[0.15px] mb-2">
                    <div className="flex justify-between text-[#a3a3a3]">
                      <div className="flex pb-0.5">Size</div>
                    </div>
                  </span>
                  <div className="flex justify-center w-full relative h-8">
                    <div className="absolute w-full h-[32px] text-sm inline-flex">
                      <input
                        className="px-2 pt-0.5 w-full bg-[#262626] focus:outline-none border-none h-full text-[#a3a3a3] rounded-lg"
                        type="number"
                        step={0.001}
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        style={{ paddingRight: "40px" }}
                      />
                      <div className="absolute top-0 flex items-center h-full space-x-1 right-3 z-1 select-none">
                        <div className="h-[20px] w-[20px]">
                          <div className="rounded-full w-5 h-5 bg-linear-to-br from-purple-500 to-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-1/2">
                  <div className="text-[#a3a3a3] flex items-end mb-2">
                    <span className="font-semibold text-[12px] leading-[14px] tracking-[0.15px] flex items-end"></span>
                  </div>
                  <div className="flex justify-center w-full relative h-8">
                    <div className="absolute w-full h-[32px] text-sm inline-flex">
                      <input
                        className="px-2 pt-0.5 w-full bg-[#262626] rounded-lg focus:outline-none border-none h-full text-[#a3a3a3]"
                        type="number"
                        value={maxUSD}
                        onChange={(e) => {
                          const newUSDValue = Number(e.target.value);
                          setMaxUSD(newUSDValue);
                          if (limitPrice > 0) {
                            const newSize = newUSDValue / limitPrice;
                            setSize(newSize.toFixed(6));
                          }
                        }}
                        style={{ paddingRight: "40px" }}
                      />
                      <div className="absolute top-0 flex items-center h-full space-x-1 right-3 z-1 select-none">
                        <div className="h-[18px] w-[18px]">
                          <div className="rounded-full w-[18px] h-[18px] bg-linear-to-br from-blue-500 to-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <span className="shrink-0 w-full pb-4"></span>

              {/* Fees and Position */}
              <div className="flex flex-col justify-center">
                <div className="flex flex-col w-full space-y-2 rounded-md">
                  <span className="font-semibold text-[12px] leading-[14px] tracking-[0.15px] flex items-center justify-between w-full">
                    <div className="text-[#a3a3a3] shrink-0">
                      <span className="font-semibold text-[12px] leading-[14px] tracking-[0.15px]">
                        Fees (0.1%)
                      </span>
                    </div>
                    <div className="text-[#d4d4d8]">
                      <span className="font-semibold text-[12px] leading-[14px] tracking-[0.15px]">
                        ${fees.toFixed(2)}
                      </span>
                    </div>
                  </span>
                  <span className="font-semibold text-[12px] leading-[14px] tracking-[0.15px] flex items-center justify-between w-full">
                    <div className="text-[#a3a3a3] shrink-0">Position</div>
                    <div className="text-[#d4d4d8]">
                      <span className="font-semibold text-[12px] leading-[14px] tracking-[0.15px]">
                        {position.toFixed(2)} SOL
                      </span>
                    </div>
                  </span>
                </div>

                <span className="shrink-0 w-full pb-2"></span>
                <span className="shrink-0 w-full pb-3"></span>

                {/* Buy/Sell Button */}
                <button
                  onClick={handleCreateOrder}
                  className={`space-x-2 disabled:cursor-not-allowed disabled:opacity-50 inline-flex rounded-xl items-center justify-center transition-all w-full h-[44px] py-[6px] px-[12px] ${
                    isBuyMode
                      ? "bg-[#34cb88]/80 hover:bg-[#5dd5a0] text-black"
                      : "bg-[#ff615c]/80 hover:bg-[#ff887f] text-black"
                  }`}
                >
                  {isBuyMode ? <span>Buy</span> : <span>Sell</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
