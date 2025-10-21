-- Docker initialization script for the exchange database
-- This runs automatically when the PostgreSQL container starts

-- Ensure the database exists (already created by POSTGRES_DB env var)
\c exchange;

-- Create trades table if it doesn't exist (also created by the application)
CREATE TABLE IF NOT EXISTS trades (
    trade_id BIGINT PRIMARY KEY,
    market VARCHAR NOT NULL,
    price NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    user_id VARCHAR NOT NULL,
    other_user_id VARCHAR NOT NULL,
    order_id VARCHAR NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table for order management
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    market VARCHAR NOT NULL,
    price NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    side VARCHAR NOT NULL CHECK (side IN ('BUY', 'SELL')),
    status VARCHAR DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FILLED', 'CANCELLED', 'PARTIALLY_FILLED')),
    filled_quantity NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table for user management
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    username VARCHAR UNIQUE,
    email VARCHAR UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user balances table
CREATE TABLE IF NOT EXISTS user_balances (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    asset VARCHAR NOT NULL,
    available_balance NUMERIC DEFAULT 0 CHECK (available_balance >= 0),
    locked_balance NUMERIC DEFAULT 0 CHECK (locked_balance >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, asset)
);

-- Create markets table for supported trading pairs
CREATE TABLE IF NOT EXISTS markets (
    id VARCHAR PRIMARY KEY,
    base_asset VARCHAR NOT NULL,
    quote_asset VARCHAR NOT NULL,
    min_price NUMERIC DEFAULT 0,
    max_price NUMERIC,
    min_quantity NUMERIC DEFAULT 0,
    max_quantity NUMERIC,
    price_precision INTEGER DEFAULT 8,
    quantity_precision INTEGER DEFAULT 8,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default markets
INSERT INTO markets (id, base_asset, quote_asset) VALUES 
('BTC_USDT', 'BTC', 'USDT'),
('ETH_USDT', 'ETH', 'USDT'),
('BTC_ETH', 'BTC', 'ETH')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trades_market ON trades(market);
CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_market ON orders(market);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO exchange_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO exchange_user;