import axios from "axios";

const ENGINE_API_URL = process.env.NEXT_PUBLIC_ENGINE_API_URL || "http://localhost:8081/api/v1";

export type OrderSide = "BUY" | "SELL";

export interface CreateOrderRequest {
  market: string;
  price: string;
  quantity: string;
  side: OrderSide;
  order_type: "LIMIT" | "MARKET";
  user_id: string;
}

export interface Order {
  order_id: string;
  market: string;
  price: string;
  quantity: string;
  filled_quantity?: string;
  side: OrderSide;
  status: string;
  created_at: string;
}

export interface OrderResponse {
  orderId: string;
  executedQty: string;
  fills: {
    price: string;
    qty: string;
    tradeId: string;
  }[];
}

export interface CancelOrderRequest {
  order_id: string;
  user_id: string;
  price: string;
  side: OrderSide;
  market: string;
}

export interface GetOpenOrdersRequest {
  user_id: string;
  market: string;
}

// Create axios instance for order API
const orderApiClient = axios.create({
  baseURL: ENGINE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const OrderApi = {
  /**
   * Create a new order (limit order)
   */
  createOrder: async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
    try {
      const response = await orderApiClient.post("/order", orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  /**
   * Get all open orders for a user in a market
   */
  getOpenOrders: async (request: GetOpenOrdersRequest): Promise<Order[]> => {
    try {
      const response = await orderApiClient.post("/orders", request);
      return response.data;
    } catch (error) {
      console.error("Error fetching open orders:", error);
      throw error;
    }
  },

  /**
   * Cancel a specific order
   */
  cancelOrder: async (request: CancelOrderRequest): Promise<void> => {
    try {
      await orderApiClient.delete("/order", {
        data: request,
      });
    } catch (error) {
      console.error("Error canceling order:", error);
      throw error;
    }
  },

  /**
   * Cancel all orders for a user in a market
   */
  cancelAllOrders: async (user_id: string, market: string): Promise<void> => {
    try {
      await orderApiClient.delete("/orders", {
        data: {
          user_id,
          market,
        },
      });
    } catch (error) {
      console.error("Error canceling all orders:", error);
      throw error;
    }
  },
};
