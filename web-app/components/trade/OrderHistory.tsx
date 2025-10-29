"use client";

import { useEffect, useState } from "react";
import { OrderApi, Order } from "@/lib/order-api";
import { useUser } from "@/hooks/use-auth";

interface OrderHistoryProps {
  market: string;
}

export const OrderHistory = ({ market }: OrderHistoryProps) => {
  const { data: user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // For now, we'll show open orders as order history
        // TODO: Implement actual order history from trades/filled orders
        const openOrders = await OrderApi.getOpenOrders({
          user_id: user.id.toString(),
          market,
        });
        setOrders(openOrders);
      } catch (error) {
        console.error("Error fetching order history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderHistory();
  }, [user, market]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-400">Loading order history...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-400">No order history available</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-2">
        {orders.map((order, index) => (
          <div
            key={order.order_id || index}
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 hover:bg-zinc-900/70 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  order.side === "BUY"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {order.side}
                </div>
                <div className="text-white font-cabinet-medium">
                  {order.market}
                </div>
              </div>

              <div className="text-right">
                <div className="text-white font-cabinet-medium">
                  {order.quantity} @ ${order.price}
                </div>
                <div className="text-zinc-400 text-sm">
                  {order.status}
                </div>
              </div>

              <div className="text-zinc-500 text-sm">
                {order.created_at ? new Date(order.created_at).toLocaleString() : "N/A"}
              </div>
            </div>

            {order.filled_quantity && (
              <div className="mt-2 text-sm text-zinc-400">
                Filled: {order.filled_quantity} / {order.quantity}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};