"use client";

import { useEffect, useState } from "react";
import { OrderApi, Order } from "@/lib/order-api";
import { useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface OpenOrdersProps {
  market: string;
}

export const OpenOrders = ({ market }: OpenOrdersProps) => {
  const { data: user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const openOrders = await OrderApi.getOpenOrders({
        user_id: user.id.toString(),
        market,
      });
      setOrders(openOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!user) return;
    
    setCancellingOrderId(order.order_id);
    try {
      await OrderApi.cancelOrder({
        order_id: order.order_id,
        user_id: user.id.toString(),
        price: order.price,
        side: order.side,
        market: order.market,
      });
      // Refresh orders list
      await fetchOrders();
    } catch (error) {
      console.error("Error canceling order:", error);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleCancelAllOrders = async () => {
    if (!user) return;
    
    try {
      await OrderApi.cancelAllOrders(user.id.toString(), market);
      // Refresh orders list
      await fetchOrders();
    } catch (error) {
      console.error("Error canceling all orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [user, market]);

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-zinc-400 text-sm">
          Please login to view your orders
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-white">Your Open Orders</h3>
        {orders.length > 0 && (
          <Button
            onClick={handleCancelAllOrders}
            variant="outline"
            size="sm"
            className="text-xs bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/40 h-7 px-2"
          >
            Cancel All
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-green-500 border-r-transparent"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-400 text-sm">No open orders</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-zinc-900/50 rounded border border-zinc-800 p-3 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          order.side === "BUY"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {order.side}
                      </span>
                      <span className="text-xs text-zinc-500">{order.market}</span>
                    </div>
                    <div className="text-sm text-white">
                      {order.quantity} @ ${order.price}
                    </div>
                    {order.filled_quantity && parseFloat(order.filled_quantity) > 0 && (
                      <div className="text-xs text-zinc-400">
                        Filled: {order.filled_quantity}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleCancelOrder(order)}
                    disabled={cancellingOrderId === order.order_id}
                    size="sm"
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 h-7 px-3"
                  >
                    {cancellingOrderId === order.order_id ? "Canceling..." : "Cancel"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
