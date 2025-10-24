import { WS_URL } from "./exchange-api";

export class WsManager {
  private ws: WebSocket | null = null;
  private static instance: WsManager;
  private bufferedMessages: any[] = [];
  private callbacks: any = {};
  private id: number;
  private initialized: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  private constructor() {
    this.bufferedMessages = [];
    this.id = 1;
    this.init();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new WsManager();
    }
    return this.instance;
  }

  init() {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.initialized = true;
        this.reconnectAttempts = 0;
        this.bufferedMessages.forEach((message) => {
          this.ws?.send(JSON.stringify(message));
        });
        this.bufferedMessages = [];
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const type = message.data?.e || message.type;
        
        if (this.callbacks[type]) {
          this.callbacks[type].forEach(({ callback }: { callback: any }) => {
            if (type === "depth") {
              const updatedBids = message.data.b;
              const updatedAsks = message.data.a;
              callback({ bids: updatedBids, asks: updatedAsks });
            } else if (type === "trade") {
              const trades = message.data;
              callback(trades);
            } else {
              callback(message.data || message);
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
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
          setTimeout(() => this.init(), 3000);
        }
      };
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
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
      console.error("Error sending message:", error);
      this.bufferedMessages.push(messageToSend);
    }
  }

  registerCallback(type: string, callback: any, id: string) {
    this.callbacks[type] = this.callbacks[type] || [];
    this.callbacks[type].push({ callback, id });
  }

  deRegisterCallback(type: string, id: string) {
    if (this.callbacks[type]) {
      const index = this.callbacks[type].findIndex(
        (callback: any) => callback.id === id
      );
      if (index !== -1) {
        this.callbacks[type].splice(index, 1);
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.initialized = false;
    }
  }
}
