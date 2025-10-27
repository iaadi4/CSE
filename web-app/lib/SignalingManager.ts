import { Ticker } from "./types";

// Update this to your WebSocket service URL
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

export class SignalingManager {
  private ws: WebSocket | null = null;
  private static instance: SignalingManager;
  private bufferedMessages: any[] = [];
  private callbacks: any = {};
  private id: number;
  private initialized: boolean = false;
  private isReconnecting: boolean = false;

  private constructor() {
    this.bufferedMessages = [];
    this.id = 1;
    this.init();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }
    return this.instance;
  }

  init() {
    if (typeof window === "undefined") return; // Don't initialize on server
    
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.initialized = true;
        this.isReconnecting = false;
        this.bufferedMessages.forEach((message) => {
          this.ws?.send(JSON.stringify(message));
        });
        this.bufferedMessages = [];
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const type = message.data?.e || message.e;
        
        if (this.callbacks[type]) {
          this.callbacks[type].forEach(({ callback }: any) => {
            if (type === "ticker") {
              const newTicker: Partial<Ticker> = {
                lastPrice: message.data.c,
                high: message.data.h,
                low: message.data.l,
                volume: message.data.v,
                quoteVolume: message.data.V,
                symbol: message.data.s,
                priceChange: message.data.p,
                priceChangePercent: message.data.P,
              };
              callback(newTicker);
            }
            if (type === "depth") {
              const updatedBids = message.data.b;
              const updatedAsks = message.data.a;
              callback({ bids: updatedBids, asks: updatedAsks });
            }
            if (type === "trade") {
              // Map short field names to full names expected by Trade interface
              const trade = {
                id: message.data.t,
                price: message.data.p,
                quantity: message.data.q,
                timestamp: message.data.T,
                isBuyerMaker: message.data.m,
                quoteQuantity: (parseFloat(message.data.p) * parseFloat(message.data.q)).toString(),
              };
              callback(trade);
            }
          });
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.initialized = false;
        
        // Attempt to reconnect after 3 seconds
        if (!this.isReconnecting) {
          this.isReconnecting = true;
          setTimeout(() => {
            console.log("Attempting to reconnect...");
            this.init();
          }, 3000);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
    }
  }

  sendMessage(message: any) {
    const messageToSend = {
      ...message,
      id: this.id++,
    };
    
    if (!this.initialized || !this.ws) {
      this.bufferedMessages.push(messageToSend);
      return;
    }
    
    try {
      this.ws.send(JSON.stringify(messageToSend));
    } catch (error) {
      console.error("Failed to send message:", error);
      this.bufferedMessages.push(messageToSend);
    }
  }

  async registerCallback(type: string, callback: any, id: string) {
    this.callbacks[type] = this.callbacks[type] || [];
    this.callbacks[type].push({ callback, id });
  }

  async deRegisterCallback(type: string, id: string) {
    if (this.callbacks[type]) {
      const index = this.callbacks[type].findIndex(
        (callback: any) => callback.id === id
      );
      if (index !== -1) {
        this.callbacks[type].splice(index, 1);
      }
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.initialized = false;
    }
  }
}
