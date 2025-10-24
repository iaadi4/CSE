import axios from "axios";

// For local development, use localhost. For production, use your deployed URL
const BASE_URL = process.env.NEXT_PUBLIC_EXCHANGE_API_URL || "http://localhost:8080/api/v1";
const WS_URL = process.env.NEXT_PUBLIC_EXCHANGE_WS_URL || "ws://localhost:8080/ws";

export interface Trade {
  id: string;
  isBuyerMaker: boolean;
  price: string;
  quantity: string;
  quoteQuantity: string;
  timestamp: number;
}

export interface Depth {
  bids: [string, string][];
  asks: [string, string][];
  lastUpdateId: string;
}

export interface Ticker {
  symbol: string;
  high: string;
  low: string;
  volume: string;
  priceChange: string;
  firstPrice: string;
  lastPrice: string;
}

export interface KLine {
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  end: string;
}

export interface CreateOrder {
  market: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  userId: string;
}

export interface UserId {
  user_id: string;
}

// API Functions
export async function getDepth(market: string): Promise<Depth> {
  // Backend connection commented out - using dummy data
  // try {
  //   const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`);
  //   return response.data;
  // } catch (error) {
  //   // Backend not available, using dummy data
  //   return generateDummyDepth();
  // }
  return generateDummyDepth();
}

export async function getTrades(market: string): Promise<Trade[]> {
  // Backend connection commented out - using dummy data
  // try {
  //   const response = await axios.get(`${BASE_URL}/trades?symbol=${market}`);
  //   return response.data;
  // } catch (error) {
  //   // Backend not available, using dummy data
  //   return generateDummyTrades();
  // }
  return generateDummyTrades();
}

export async function getKlines(
  market: string,
  interval: string,
  startTime: number
): Promise<KLine[]> {
  // Backend connection commented out - using dummy data
  // try {
  //   const response = await axios.get(
  //     `${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}`
  //   );
  //   const data: KLine[] = response.data;
  //   return data.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1));
  // } catch (error) {
  //   // Backend not available, using dummy data
  //   return generateDummyKlines();
  // }
  return generateDummyKlines();
}

export async function getTicker(market: string): Promise<Ticker> {
  // Backend connection commented out - using dummy data
  // try {
  //   const tickers = await getTickers();
  //   const ticker = tickers.find((t) => t.symbol === market);
  //   if (!ticker) {
  //     throw new Error(`No ticker found for ${market}`);
  //   }
  //   return ticker;
  // } catch (error) {
  //   // Backend not available, using dummy data
  //   return generateDummyTicker(market);
  // }
  return generateDummyTicker(market);
}

export async function getTickers(): Promise<Ticker[]> {
  // Backend connection commented out - using dummy data
  // try {
  //   const response = await axios.get(`${BASE_URL}/tickers`);
  //   return response.data;
  // } catch (error) {
  //   // Backend not available, using dummy data
  //   return [generateDummyTicker("SOL_USDC")];
  // }
  return [generateDummyTicker("SOL_USDC")];
}

export async function createOrder(order: CreateOrder): Promise<string> {
  // Backend connection commented out - simulating successful order
  // try {
  //   const response = await axios.post(`${BASE_URL}/order`, {
  //     market: order.market,
  //     side: order.side,
  //     quantity: order.quantity,
  //     price: order.price,
  //     user_id: order.userId,
  //   });
  //   return response.data;
  // } catch (error) {
  //   console.error("Error creating order:", error);
  //   throw error;
  // }
  console.log("Order created (dummy mode):", order);
  return `dummy_order_${Date.now()}`;
}

export async function createUser(): Promise<UserId> {
  // Backend connection commented out - using dummy user
  // try {
  //   const response = await axios.post(`${BASE_URL}/users`);
  //   return response.data;
  // } catch (error) {
  //   // Backend not available, creating dummy user
  //   return { user_id: `dummy_${Date.now()}` };
  // }
  return { user_id: `dummy_${Date.now()}` };
}

// Dummy data generators for development
function generateDummyDepth(): Depth {
  const basePrice = 148.5;
  const bids: [string, string][] = Array.from({ length: 30 }, (_, i) => [
    (basePrice - i * 0.1).toFixed(2),
    (Math.random() * 10 + 1).toFixed(4),
  ]);
  
  const asks: [string, string][] = Array.from({ length: 30 }, (_, i) => [
    (basePrice + 0.1 + i * 0.1).toFixed(2),
    (Math.random() * 10 + 1).toFixed(4),
  ]);

  return {
    bids,
    asks,
    lastUpdateId: Date.now().toString(),
  };
}

function generateDummyTrades(): Trade[] {
  const basePrice = 148.5;
  return Array.from({ length: 50 }, (_, i) => ({
    id: `trade_${Date.now()}_${i}`,
    isBuyerMaker: Math.random() > 0.5,
    price: (basePrice + (Math.random() - 0.5) * 2).toFixed(2),
    quantity: (Math.random() * 5 + 0.1).toFixed(4),
    quoteQuantity: "0",
    timestamp: Date.now() - i * 60000,
  }));
}

function generateDummyKlines(): KLine[] {
  const basePrice = 148.5;
  const now = Date.now();
  return Array.from({ length: 100 }, (_, i) => {
    const open = basePrice + (Math.random() - 0.5) * 5;
    const close = open + (Math.random() - 0.5) * 2;
    const high = Math.max(open, close) + Math.random();
    const low = Math.min(open, close) - Math.random();
    
    return {
      open: open.toFixed(2),
      high: high.toFixed(2),
      low: low.toFixed(2),
      close: close.toFixed(2),
      volume: (Math.random() * 1000).toFixed(2),
      end: (now - (100 - i) * 60000).toString(),
    };
  });
}

function generateDummyTicker(market: string): Ticker {
  const lastPrice = 148.5 + (Math.random() - 0.5) * 5;
  const firstPrice = lastPrice - (Math.random() - 0.5) * 2;
  const priceChange = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
  
  return {
    symbol: market,
    high: (lastPrice + Math.random() * 2).toFixed(2),
    low: (lastPrice - Math.random() * 2).toFixed(2),
    volume: (Math.random() * 1000000).toFixed(2),
    priceChange,
    firstPrice: firstPrice.toFixed(2),
    lastPrice: lastPrice.toFixed(2),
  };
}

export { BASE_URL, WS_URL };
