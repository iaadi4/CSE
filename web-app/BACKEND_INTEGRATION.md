# Backend Integration Guide

This document explains how the web-app connects to the engine-service backend.

## Overview

The web-app has been updated to connect to the engine-service backend for real-time market data, orderbook depth, and trade information.

## Architecture

### API Client (`lib/httpClient.ts`)
- Fetches initial data from REST API endpoints
- Used for tickers, depth, trades, and klines
- Base URL configured via `NEXT_PUBLIC_API_URL` environment variable

### WebSocket Manager (`lib/SignalingManager.ts`)
- Singleton class managing WebSocket connection
- Handles real-time updates for ticker, depth, and trade data
- Auto-reconnects on connection loss
- URL configured via `NEXT_PUBLIC_WS_URL` environment variable

### Types (`lib/types.ts`)
- TypeScript interfaces for Ticker, Depth, Trade, KLine data structures
- Ensures type safety across the application

## Pages

### Market Page (`app/market/page.tsx`)
- **Server Component**: Fetches initial ticker data on the server
- **MarketList Component**: Client component displaying markets with search and sorting
- **Features**:
  - Search by symbol
  - Sort by symbol, price, change, or volume
  - Clickable rows navigate to trade page
  - Mini sparkline charts for each market

### Trade Page (`app/trade/[market]/page.tsx`)
- **Dynamic Route**: Market symbol in URL (e.g., `/trade/SOL_USDC`)
- **Layout**: Sidebar + MarketBar + (Chart | OrderBook + Trades)
- **Components**:
  - **MarketBar**: Real-time ticker with price, 24h change, high, low, volume
  - **TradeView**: Candlestick chart with multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d)
  - **Depth**: Real-time orderbook with bids (green) and asks (red)
  - **TradeList**: Recent trades list with real-time updates

## Real-Time Data Flow

### Ticker Updates
```typescript
// Subscribe
SignalingManager.getInstance().sendMessage({
  method: "SUBSCRIBE",
  params: [`ticker.${market}`]
});

// Handle updates
SignalingManager.getInstance().registerCallback("ticker", (data) => {
  // Update ticker state
}, `TICKER-${market}`);
```

### Depth Updates
```typescript
// Subscribe
SignalingManager.getInstance().sendMessage({
  method: "SUBSCRIBE",
  params: [`depth.${market}`]
});

// Handle updates
SignalingManager.getInstance().registerCallback("depth", (data) => {
  // Update bids/asks arrays
}, `DEPTH-${market}`);
```

### Trade Updates
```typescript
// Subscribe
SignalingManager.getInstance().sendMessage({
  method: "SUBSCRIBE",
  params: [`trade.${market}`]
});

// Handle updates
SignalingManager.getInstance().registerCallback("trade", (newTrade) => {
  // Add to trades list
}, `TRADES-${market}`);
```

## Setup

1. **Copy environment file**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   NEXT_PUBLIC_WS_URL=ws://localhost:8080
   ```

3. **Ensure backend services are running**:
   - Engine service router (HTTP API): `http://localhost:3001`
   - WebSocket stream service: `ws://localhost:8080`

4. **Run the web app**:
   ```bash
   npm run dev
   ```

## Backend Endpoints Used

### REST API (engine-service/router)
- `GET /api/v1/tickers` - Get all market tickers
- `GET /api/v1/depth?symbol=SOL_USDC` - Get orderbook depth
- `GET /api/v1/trades?symbol=SOL_USDC` - Get recent trades
- `GET /api/v1/klines?symbol=SOL_USDC&interval=1h&startTime=X&endTime=Y` - Get candlestick data

### WebSocket (ws-stream service)
- Subscribe: `{"method":"SUBSCRIBE","params":["ticker.SOL_USDC"],"id":1}`
- Subscribe: `{"method":"SUBSCRIBE","params":["depth.SOL_USDC"],"id":2}`
- Subscribe: `{"method":"SUBSCRIBE","params":["trade.SOL_USDC"],"id":3}`
- Unsubscribe: `{"method":"UNSUBSCRIBE","params":["ticker.SOL_USDC"],"id":4}`

## Key Features

### Server Components
- Market page uses server-side data fetching for SEO and initial load performance
- Falls back gracefully if backend is unavailable

### Client Components
- Trade page components use client-side rendering for real-time updates
- WebSocket connections managed with proper cleanup on unmount
- Auto-reconnect on connection loss

### Error Handling
- API errors caught and logged
- WebSocket errors trigger reconnection attempts
- UI shows loading states and error messages when appropriate

## Troubleshooting

### No data showing
1. Check if backend services are running
2. Verify environment variables in `.env.local`
3. Check browser console for error messages
4. Ensure CORS is enabled on backend

### WebSocket not connecting
1. Check `NEXT_PUBLIC_WS_URL` in `.env.local`
2. Verify WebSocket service is running
3. Check browser console for WebSocket errors
4. Ensure firewall allows WebSocket connections

### Chart not rendering
1. Ensure `lightweight-charts` package is installed
2. Check if KLine data is being fetched successfully
3. Verify timestamps are in correct format (Unix seconds)
