# Creator Stock Exchange

A comprehensive cryptocurrency trading platform with real-time order matching, user management, and modern web interface.

## 🏗️ Architecture

The system consists of multiple services:

- **Engine Service** (Rust) - Core trading engine with order matching
- **User Service** (Node.js/TypeScript) - User authentication, balances, and profiles
- **Web App** (Next.js) - Modern React frontend with trading interface
- **PostgreSQL** - Primary database for users, orders, and trades
- **Redis** - Message queue for inter-service communication
- **WebSocket Service** - Real-time trade updates and notifications

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ & npm/pnpm
- Rust 1.70+
- PostgreSQL client (optional, for direct database access)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd CSE
```

### 2. Start Infrastructure (Database & Redis)

```bash
# Start PostgreSQL and Redis using Docker Compose
cd user-service
docker compose up -d postgres

cd ../engine-service
docker compose up -d db redis
```

### 3. Setup User Service

```bash
cd user-service

# Install dependencies
npm install

# Setup database
npx prisma migrate dev --name init

# Create test users (optional)
node scripts/create-admin.js

# Start user service
npm run dev
```

### 4. Setup Engine Service

```bash
cd engine-service

# Build the Rust services
cargo build --release

# Start database processor (handles trade persistence)
REDIS_URL=redis://localhost:6379 DATABASE_URL=postgresql://postgres:postgres@localhost:5432/usersvc cargo run --bin db-processor &

# Start WebSocket service (real-time updates)
WS_STREAM_URL=0.0.0.0:8080 cargo run --bin ws-stream &

# Start trading engine
REDIS_URL=redis://localhost:6379 DATABASE_URL=postgresql://postgres:postgres@localhost:5432/usersvc cargo run --bin engine &

# Start API router
REDIS_URL=redis://localhost:6379 DATABASE_URL=postgresql://postgres:postgres@localhost:5432/usersvc cargo run --bin router &
```

### 5. Setup Web Application

```bash
cd web-app

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### 6. Access the Application

- **Web App**: http://localhost:3000
- **User Service API**: http://localhost:8082
- **Engine Service API**: http://localhost:8081
- **WebSocket**: ws://localhost:8080

## 🔧 Manual Setup (Alternative)

If you prefer not to use Docker for databases:

### PostgreSQL Setup

```bash
# Install PostgreSQL locally
# Create databases
createdb usersvc
createdb exchange

# Set up environment variables
export DATABASE_URL="postgresql://postgres:password@localhost:5432/usersvc"
```

### Redis Setup

```bash
# Install Redis locally or use Docker
docker run -d -p 6379:6379 redis:6.2-alpine
```

## 🧪 Testing the System

### Create Test Users

```bash
cd user-service
node scripts/create-test-user.js
```

### Add Balance to Test User

```bash
# Connect to database
PGPASSWORD=postgres psql -h localhost -U postgres -d usersvc

# Add SOL balance (replace USER_ID with actual user ID)
INSERT INTO user_balances (id, user_id, currency, balance, locked_balance, updated_at)
VALUES (gen_random_uuid(), USER_ID, 'SOL', 100.0, 0.0, NOW());
```

### Test Trading

1. Open http://localhost:3000
2. Register/Login as a user
3. Navigate to /trade/SOL_USDC
4. Place buy/sell orders
5. Check real-time updates via WebSocket

## 📊 API Endpoints

### User Service (Port 8082)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/balance/:currency` - Get user balance
- `POST /api/balance/update` - Update user balance

### Engine Service (Port 8081)
- `GET /api/v1/tickers` - Get market tickers
- `GET /api/v1/depth?symbol=SOL_USDC` - Get order book depth
- `GET /api/v1/trades?symbol=SOL_USDC` - Get recent trades
- `GET /api/v1/klines?symbol=SOL_USDC&interval=1h` - Get candlestick data
- `POST /api/v1/order` - Place new order

## 🔍 Troubleshooting

### Common Issues

**Engine service fails to start:**
- Ensure Redis is running on port 6379
- Check DATABASE_URL environment variable
- Verify PostgreSQL connection

**Chart not displaying:**
- Check klines API endpoint: `curl http://localhost:8081/api/v1/klines?symbol=SOL_USDC&interval=1h&startTime=1727022600&endTime=$(date +%s)`
- Verify trade data exists in database

**WebSocket connection fails:**
- Ensure ws-stream service is running on port 8080
- Check browser console for connection errors

**Order creation fails:**
- Verify user has sufficient balance
- Check order_type field is included (LIMIT/MARKET)
- Ensure all required fields are present

### Logs and Debugging

```bash
# Check service logs
docker logs usersvc-postgres
docker logs exchange-redis

# View application logs
tail -f user-service/logs/app.log
tail -f engine-service/engine.log
```

### Database Management

```bash
# Access PostgreSQL
PGPASSWORD=postgres psql -h localhost -U postgres -d usersvc

# View tables
\d
\dt

# Check recent trades
SELECT * FROM trades ORDER BY timestamp DESC LIMIT 10;

# Check user balances
SELECT * FROM user_balances WHERE user_id = 1;
```

## 🛠️ Development

### Adding New Features

1. **Backend Changes**: Modify Rust code in `engine-service/crates/`
2. **API Changes**: Update routes in `engine-service/crates/router/src/routes/`
3. **Frontend Changes**: Modify React components in `web-app/components/`
4. **Database Changes**: Update Prisma schema in `user-service/prisma/`

### Running Tests

```bash
# Engine service tests
cd engine-service && cargo test

# User service tests
cd user-service && npm test

# Web app tests
cd web-app && pnpm test
```

## 📝 Environment Variables

### User Service (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/usersvc
JWT_SECRET=your-secret-key
PORT=8082
```

### Engine Service (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/usersvc
REDIS_URL=redis://localhost:6379
WS_STREAM_URL=0.0.0.0:8080
USER_SERVICE_URL=http://localhost:8082
```

### Web App (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8082
NEXT_PUBLIC_MARKET_API_URL=http://localhost:8081/api/v1
NEXT_PUBLIC_ENGINE_API_URL=http://localhost:8081/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.</content>
<parameter name="filePath">/home/agnish/projects/CSE/README.md