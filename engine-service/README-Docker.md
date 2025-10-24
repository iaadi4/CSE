# CS Exchange - Containerized Deployment

This guide explains how to deploy the CS Exchange services using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM available for containers

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd "/media/Programming/cs exchange/server/services/engine-service"
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **For production deployment:**
   ```bash
   cp .env.production .env
   # Edit .env with your production settings
   docker-compose up -d --build
   ```

## Services Overview

The system consists of the following containerized services:

### Core Services
- **router** (Port 8081) - Main API gateway handling HTTP requests
- **core-engine** - Trading engine processing orders
- **ws-stream** (Port 8082) - WebSocket server for real-time data
- **database-service** (Port 8080) - Database management service

### Infrastructure Services
- **postgres** (Port 5432) - PostgreSQL database
- **redis** (Port 6379) - Redis cache and message broker

## API Endpoints

Once running, you can access:

- **REST API:** http://localhost:8081
- **WebSocket:** ws://localhost:8082
- **Database Service:** http://localhost:8080

### Available REST Endpoints:

- `POST /orders` - Create new order
- `GET /orders/open` - Get open orders
- `DELETE /orders/{id}` - Cancel order
- `GET /depth` - Get market depth/orderbook
- `GET /trades` - Get recent trades
- `GET /klines` - Get candlestick data
- `GET /tickers` - Get market tickers
- `POST /users` - Create user

## Docker Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d

# Scale a specific service
docker-compose up --scale core-engine=3 -d
```

### Development
```bash
# Build only
docker-compose build

# Start specific services
docker-compose up postgres redis -d

# Execute commands in container
docker-compose exec router /bin/bash
```

### Maintenance
```bash
# View running containers
docker-compose ps

# Remove everything including volumes
docker-compose down -v

# Prune unused images
docker image prune -a
```

## Configuration

### Environment Variables

Key configuration is handled through environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SERVER_ADDR` - Router service bind address
- `WS_PORT` - WebSocket service port
- `RUST_LOG` - Logging level (debug, info, warn, error)

### Production Considerations

1. **Security:**
   - Change default passwords in `.env.production`
   - Use secrets management (Docker Secrets, Kubernetes Secrets)
   - Enable TLS/SSL for external connections
   - Configure firewall rules

2. **Performance:**
   - Increase PostgreSQL memory settings for production
   - Configure Redis persistence settings
   - Set appropriate container resource limits

3. **Monitoring:**
   - Add health check endpoints
   - Configure log aggregation
   - Set up metrics collection

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep -E ':(5432|6379|8080|8081|8082)'
   
   # Change ports in docker-compose.yml if needed
   ```

2. **Database connection issues:**
   ```bash
   # Check database container logs
   docker-compose logs postgres
   
   # Test database connectivity
   docker-compose exec postgres psql -U exchange_user -d exchange
   ```

3. **Service startup failures:**
   ```bash
   # Check service logs
   docker-compose logs [service-name]
   
   # Restart specific service
   docker-compose restart [service-name]
   ```

### Health Checks

Check service health:
```bash
# Database
curl http://localhost:8080/health

# Router API
curl http://localhost:8081/health

# Redis
docker-compose exec redis redis-cli ping
```

## Data Persistence

- **PostgreSQL data:** Stored in named volume `postgres_data`
- **Redis data:** Stored in named volume `redis_data`

To backup data:
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U exchange_user exchange > backup.sql

# Backup Redis (if persistence is enabled)
docker-compose exec redis redis-cli BGSAVE
```

## Scaling

To scale services horizontally:
```bash
# Scale core engine for better performance
docker-compose up --scale core-engine=3 -d

# Scale with load balancer (requires additional configuration)
docker-compose up --scale router=2 -d
```

## Development vs Production

- **Development:** Uses `.env` with debug logging and development-friendly settings
- **Production:** Uses `.env.production` with optimized settings and security considerations

Remember to review and customize the configuration files for your specific deployment needs.