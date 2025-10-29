"use client";

import { useState } from "react";
import { OrderApi, OrderSide } from "@/lib/order-api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useUser } from "@/hooks/use-auth";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface OrderFormProps {
  market: string;
  currentPrice?: number;
}

export const OrderForm = ({ market, currentPrice = 0 }: OrderFormProps) => {
  const { data: user } = useUser();
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [side, setSide] = useState<OrderSide>("BUY");
  
  // Form states
  const [price, setPrice] = useState(currentPrice.toFixed(2));
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Calculate total
  const total = (parseFloat(price || "0") * parseFloat(quantity || "0")).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!user) {
      setMessage({ type: "error", text: "Please login to place orders" });
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid quantity" });
      return;
    }

    if (orderType === "limit" && (!price || parseFloat(price) <= 0)) {
      setMessage({ type: "error", text: "Please enter a valid price" });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        market,
        price: orderType === "market" ? currentPrice.toFixed(2) : price,
        quantity,
        side,
        order_type: orderType.toUpperCase() as "LIMIT" | "MARKET",
        user_id: user.id.toString(),
      };

      const response = await OrderApi.createOrder(orderData);
      
      setMessage({ 
        type: "success", 
        text: `Order placed successfully! Order ID: ${response.orderId}` 
      });

      // Reset form
      setQuantity("");
      if (orderType === "limit") {
        setPrice(currentPrice.toFixed(2));
      }
    } catch (error: any) {
      console.error("Order error:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || error.message || "Failed to place order" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSideChange = (newSide: string) => {
    setSide(newSide as OrderSide);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header with Limit/Market tabs */}
      <div className="p-4 border-b border-zinc-800">
        <Tabs value={orderType} onValueChange={(v: string) => setOrderType(v as "limit" | "market")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
            <TabsTrigger value="limit" className="data-[state=active]:bg-zinc-800">
              Limit
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-zinc-800">
              Market
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 space-y-4">
        {/* Price Input (for limit orders) */}
        {orderType === "limit" && (
          <div className="space-y-2">
            <Label htmlFor="price" className="text-zinc-400 text-xs font-medium">
              Price (USDC)
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
              placeholder="0.00"
              className="bg-zinc-900 border-zinc-800 text-white h-10 text-base"
            />
          </div>
        )}

        {/* Quantity Input */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-zinc-400 text-xs font-medium">
            Quantity
          </Label>
          <Input
            id="quantity"
            type="number"
            step="0.0001"
            value={quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
            placeholder="0.00"
            className="bg-zinc-900 border-zinc-800 text-white h-10 text-base"
          />
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-2">
          <span className="text-zinc-400 text-sm">Total</span>
          <span className="text-white font-medium text-sm">{total} USDC</span>
        </div>

        {/* Available Balance Info */}
        <div className="text-xs text-zinc-500 space-y-1">
          <div className="flex justify-between">
            <span>Available Equity</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Margin Required</span>
            <span>-</span>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`text-xs p-2 rounded ${
              message.type === "success"
                ? "bg-green-900/20 text-green-400 border border-green-800"
                : "bg-red-900/20 text-red-400 border border-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Buy/Sell Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-4">
          <Button
            type="button"
            onClick={() => {
              setSide("BUY");
              handleSubmit(new Event('submit') as any);
            }}
            disabled={isSubmitting || !user}
            className="bg-green-600 hover:bg-green-700 text-white h-11 font-medium disabled:opacity-50"
          >
            {isSubmitting && side === "BUY" ? "Buying..." : !user ? "Login" : "Buy / Long"}
          </Button>
          <Button
            type="button"
            onClick={() => {
              setSide("SELL");
              handleSubmit(new Event('submit') as any);
            }}
            disabled={isSubmitting || !user}
            className="bg-red-600 hover:bg-red-700 text-white h-11 font-medium disabled:opacity-50"
          >
            {isSubmitting && side === "SELL" ? "Selling..." : !user ? "Login" : "Sell / Short"}
          </Button>
        </div>
      </form>
    </div>
  );
};
