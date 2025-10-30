# CS Exchange

<div align="center">

**A High-Performance Creator Token Trading Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Rust](https://img.shields.io/badge/Rust-latest-orange.svg)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Services](#-services)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [WebSocket Events](#-websocket-events)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

CS Exchange is a decentralized, high-performance platform that revolutionizes how creators monetize their brand. By enabling creators to launch their own tokens, CS Exchange creates a new digital economy where fans can invest in and trade their favorite creator's tokens.

### Why CS Exchange?

- **🚀 High Performance**: Built with Rust for sub-millisecond trade execution
- **🔗 Multi-Chain Support**: Trade on Solana, Ethereum, and Bitcoin networks
- **📊 Real-Time Trading**: Professional-grade interface with live market data
- **🔒 Secure**: HD wallet management with automated fund sweeping
- **📈 Scalable**: Microservices architecture handling thousands of TPS

---

## ✨ Features

### For Creators
- **Token Launch Platform**: Deploy your own creator token in minutes
- **Community Building**: Engage directly with your token holders
- **Analytics Dashboard**: Track token performance and holder metrics
- **Social Integration**: Connect your social media profiles seamlessly

### For Traders
- **Real-Time Order Book**: Live market depth and order flow visualization
- **Advanced Charting**: Professional trading charts with technical indicators
- **Portfolio Management**: Track your investments across multiple creator tokens
- **Multi-Wallet Support**: Connect wallets from Solana, Ethereum, and Bitcoin
- **Instant Deposits**: Automatic credit upon blockchain confirmation

### For Developers
- **REST API**: Comprehensive API for programmatic trading
- **WebSocket Streams**: Real-time market data feeds
- **Open Source**: Fully transparent and auditable codebase

---

## 🏗 Architecture

CS Exchange is built on a modern microservices architecture, ensuring scalability, maintainability, and fault isolation.

### System Overview

```mermaid
graph TB
    subgraph "Client Layer"
        WebApp[Web Application<br/>Next.js + React]
    end
    
    subgraph "API Layer"
        Gateway[API Gateway<br/>Load Balancer]
    end
    
    subgraph "Service Layer"
        UserSvc[User Service<br/>Node.js + Express]
        EngineSvc[Engine Service<br/>Rust + Actix]
        IndexerSvc[Indexer Service<br/>Node.js + TypeScript]
        SweeperSvc[Sweeper Service<br/>Node.js + TypeScript]
    end
    
    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL<br/>Primary Database)]
        Redis[(Redis<br/>Cache + Sessions)]
    end
    
    subgraph "Blockchain Layer"
        Solana[Solana Network]
        Ethereum[Ethereum Network]
        Bitcoin[Bitcoin Network]
    end
    
    WebApp --> Gateway
    Gateway --> UserSvc
    Gateway --> EngineSvc
    Gateway --> IndexerSvc
    
    UserSvc --> PostgreSQL
    UserSvc --> Redis
    EngineSvc --> PostgreSQL
    EngineSvc --> Redis
    IndexerSvc --> PostgreSQL
    SweeperSvc --> PostgreSQL
    
    IndexerSvc <--> Solana
    IndexerSvc <--> Ethereum
    IndexerSvc <--> Bitcoin
    
    SweeperSvc <--> Solana
    SweeperSvc <--> Ethereum
    SweeperSvc <--> Bitcoin
```

### Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant WebApp
    participant Gateway
    participant Engine
    participant Indexer
    participant Blockchain
    participant Sweeper
    
    User->>WebApp: Place Order
    WebApp->>Gateway: POST /api/orders
    Gateway->>Engine: Process Order
    Engine->>Engine: Match Order
    Engine-->>WebApp: Order Confirmation (WebSocket)
    
    User->>Blockchain: Deposit Funds
    Blockchain->>Indexer: New Transaction
    Indexer->>Indexer: Verify Deposit
    Indexer-->>WebApp: Balance Update (WebSocket)
    
    Indexer->>Sweeper: Trigger Sweep
    Sweeper->>Blockchain: Consolidate Funds
    Sweeper->>Sweeper: Update Records
```

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: WebSocket Client
- **State Management**: React Context + Hooks

### Backend Services

#### User Service
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Language**: TypeScript

#### Engine Service
- **Language**: Rust (latest stable)
- **Framework**: Actix Web
- **Async Runtime**: Tokio
- **Serialization**: Serde
- **WebSocket**: Actix WebSocket

#### Indexer Service
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **ORM**: Prisma
- **Blockchain SDKs**: 
  - @solana/web3.js
  - ethers.js
  - bitcoinjs-lib

#### Sweeper Service
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Job Queue**: Bull (Redis-based)

### Infrastructure
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Containerization**: Docker + Docker Compose
- **Process Management**: PM2

### Blockchain Integration
- **Solana**: High-throughput, low-fee transactions
- **Ethereum**: Smart contract compatibility, vast ecosystem
- **Bitcoin**: Store of value, maximum security

---

## 🔧 Services

### 1. Web Application

The user-facing frontend application providing an intuitive trading experience.

**Key Features:**
- Responsive design optimized for desktop and mobile
- Real-time price charts with TradingView integration
- One-click trading with instant order confirmation
- Dark/light mode support

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS

---

### 2. User Service

Manages user accounts, authentication, and creator profiles.

**Responsibilities:**
- User registration and authentication
- JWT token generation and validation
- HD wallet creation and management
- Creator profile management
- KYC/AML compliance (future)

**Tech Stack:** Node.js, Express, TypeScript, Prisma, PostgreSQL

**Key Endpoints:**
```
POST   /api/users/register
POST   /api/users/login
GET    /api/users/profile
PUT    /api/users/profile
POST   /api/users/wallet
GET    /api/users/wallets
```

---

### 3. Engine Service

The high-performance matching engine built in Rust.

**Responsibilities:**
- Order matching with price-time priority
- Real-time order book management
- Trade execution and settlement
- Market data calculation (OHLCV, volume, etc.)
- WebSocket broadcasting

**Tech Stack:** Rust, Actix, Tokio, PostgreSQL, Redis

**Performance Metrics:**
- Order matching: < 1ms latency
- Throughput: 10,000+ orders/second
- WebSocket updates: < 10ms delivery

**Key Endpoints:**
```
POST   /api/orders
DELETE /api/orders/:id
GET    /api/orders
GET    /api/orders/:id
GET    /api/trades
GET    /api/orderbook/:market
```

---

### 4. Indexer Service

Monitors blockchain networks and indexes relevant transactions.

**Responsibilities:**
- Listen for deposit transactions
- Verify transaction confirmations
- Credit user accounts automatically
- Track token creation events
- Monitor smart contract interactions

**Tech Stack:** Node.js, TypeScript, Prisma, Web3 SDKs

**Supported Networks:**
- Solana (WebSocket + RPC)
- Ethereum (WebSocket + Infura)
- Bitcoin (Electrum servers)

---

### 5. Sweeper Service

Automated fund management service for security and efficiency.

**Responsibilities:**
- Monitor deposit wallet balances
- Sweep funds to central hot wallet
- Optimize transaction fees
- Maintain minimum balances for gas
- Generate sweep reports

**Tech Stack:** Node.js, TypeScript, Bull Queue, Redis

**Configuration:**
- Sweep threshold: Configurable per chain
- Fee optimization: Dynamic gas price calculation
- Schedule: Continuous monitoring + scheduled sweeps

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **Rust**: Latest stable version (1.70+)
- **Docker**: 20.10 or higher
- **Docker Compose**: 2.0 or higher
- **PostgreSQL**: 15+ (or use Docker)
- **Redis**: 7+ (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iaadi4/CSE.git
   cd CSE
   ```

2. **Install dependencies**
   ```bash
   # User Service
   cd user-service
   npm install
   
   # Indexer Service
   cd ../indexer-service
   npm install
   
   # Sweeper Service
   cd ../sweeper-service
   npm install
   
   # Web Application
   cd ../web-app
   npm install
   
   # Engine Service (Rust)
   cd ../engine-service
   cargo build --release
   ```

3. **Configure environment variables**

   Create `.env` files in each service directory:

   ```bash
   # user-service/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/cs_exchange"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3001
   
   # indexer-service/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/cs_exchange"
   SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
   ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/YOUR_KEY"
   
   # sweeper-service/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/cs_exchange"
   HOT_WALLET_PRIVATE_KEY="your-hot-wallet-key"
   
   # engine-service/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/cs_exchange"
   REDIS_URL="redis://localhost:6379"
   PORT=8080
   ```

4. **Set up the database**
   ```bash
   cd user-service
   npx prisma migrate dev
   npx prisma generate
   ```

### Running with Docker Compose (Recommended)

1. **Navigate to the Docker directory**
   ```bash
   cd engine-service/docker
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Verify services are running**
   ```bash
   docker-compose ps
   ```

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

### Running Services Individually

If you prefer to run services separately:

```bash
# Terminal 1 - PostgreSQL & Redis
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15
docker run -d -p 6379:6379 redis:7

# Terminal 2 - User Service
cd user-service
npm run dev

# Terminal 3 - Engine Service
cd engine-service
cargo run --release

# Terminal 4 - Indexer Service
cd indexer-service
npm run dev

# Terminal 5 - Sweeper Service
cd sweeper-service
npm run dev

# Terminal 6 - Web App
cd web-app
npm run dev
```

### Accessing the Platform

Once all services are running:

- **Web Application**: http://localhost:3000
- **User Service API**: http://localhost:3001
- **Engine Service API**: http://localhost:8080
- **WebSocket**: ws://localhost:8080/ws

---

## 📚 API Documentation

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### User Service Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "username": "creator_name"
}

Response: 201 Created
{
  "userId": "uuid",
  "token": "jwt_token"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "creator_name"
  }
}
```

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "creator_name",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Create Wallet
```http
POST /api/users/wallet
Authorization: Bearer <token>
Content-Type: application/json

{
  "blockchain": "solana"
}

Response: 201 Created
{
  "address": "wallet_address",
  "blockchain": "solana"
}
```

### Engine Service Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "market": "CREATOR/USDC",
  "side": "buy",
  "type": "limit",
  "price": "10.50",
  "quantity": "100"
}

Response: 201 Created
{
  "orderId": "uuid",
  "status": "open",
  "filled": "0",
  "remaining": "100"
}
```

#### Cancel Order
```http
DELETE /api/orders/:orderId
Authorization: Bearer <token>

Response: 200 OK
{
  "orderId": "uuid",
  "status": "cancelled"
}
```

#### Get Orders
```http
GET /api/orders?market=CREATOR/USDC&status=open
Authorization: Bearer <token>

Response: 200 OK
{
  "orders": [
    {
      "orderId": "uuid",
      "market": "CREATOR/USDC",
      "side": "buy",
      "price": "10.50",
      "quantity": "100",
      "filled": "50",
      "status": "partial"
    }
  ]
}
```

#### Get Order Book
```http
GET /api/orderbook/CREATOR-USDC

Response: 200 OK
{
  "bids": [
    ["10.50", "1000"],
    ["10.45", "2000"]
  ],
  "asks": [
    ["10.55", "1500"],
    ["10.60", "2500"]
  ],
  "timestamp": 1234567890
}
```

---

## 🔌 WebSocket Events

Connect to the WebSocket server at `ws://localhost:8080/ws`

### Subscribe to Market Data

```javascript
// Connect
const ws = new WebSocket('ws://localhost:8080/ws');

// Subscribe to order book updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'orderbook',
  market: 'CREATOR/USDC'
}));

// Subscribe to trades
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'trades',
  market: 'CREATOR/USDC'
}));

// Subscribe to ticker
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'ticker',
  market: 'CREATOR/USDC'
}));
```

### Event Types

#### Order Book Update
```json
{
  "type": "orderbook",
  "market": "CREATOR/USDC",
  "bids": [["10.50", "1000"]],
  "asks": [["10.55", "1500"]],
  "timestamp": 1234567890
}
```

#### Trade Event
```json
{
  "type": "trade",
  "market": "CREATOR/USDC",
  "price": "10.52",
  "quantity": "50",
  "side": "buy",
  "timestamp": 1234567890
}
```

#### Ticker Update
```json
{
  "type": "ticker",
  "market": "CREATOR/USDC",
  "last": "10.52",
  "high": "11.00",
  "low": "10.00",
  "volume": "50000",
  "change": "+5.2%",
  "timestamp": 1234567890
}
```

---

## 💻 Development

### Project Structure

```
cs-exchange/
├── web-app/                 # Next.js frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   └── lib/           # Utilities
│   └── package.json
│
├── user-service/           # User management service
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Data models
│   │   └── middleware/    # Express middleware
│   ├── prisma/            # Database schema
│   └── package.json
│
├── engine-service/         # Trading engine (Rust)
│   ├── src/
│   │   ├── matching/      # Order matching logic
│   │   ├── orderbook/     # Order book management
│   │   ├── websocket/     # WebSocket handling
│   │   └── main.rs
│   ├── docker/            # Docker configs
│   └── Cargo.toml
│
├── indexer-service/        # Blockchain indexer
│   ├── src/
│   │   ├── indexers/      # Chain-specific indexers
│   │   ├── processors/    # Transaction processors
│   │   └── index.ts
│   └── package.json
│
└── sweeper-service/        # Fund management
    ├── src/
    │   ├── sweepers/      # Chain-specific sweepers
    │   ├── jobs/          # Scheduled jobs
    │   └── index.ts
    └── package.json
```

### Running Tests

```bash
# User Service
cd user-service
npm test

# Engine Service
cd engine-service
cargo test

# Indexer Service
cd indexer-service
npm test

# Web App
cd web-app
npm test
```

### Code Style

- **TypeScript/JavaScript**: ESLint + Prettier
- **Rust**: rustfmt + clippy

```bash
# Format TypeScript
npm run format

# Format Rust
cargo fmt
cargo clippy
```

---

## 🚢 Deployment

### Production Considerations

1. **Security**
   - Use secure JWT secrets
   - Implement rate limiting
   - Enable CORS properly
   - Use HTTPS everywhere
   - Secure private keys in HSM

2. **Scalability**
   - Use load balancers
   - Implement horizontal scaling
   - Set up database replication
   - Use Redis cluster

3. **Monitoring**
   - Set up logging (ELK stack)
   - Configure alerting (Prometheus + Grafana)
   - Track performance metrics
   - Monitor blockchain sync status

### Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure all tests pass before submitting PR



<div align="center">