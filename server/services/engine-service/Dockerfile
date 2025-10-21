FROM rust:1.75 AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy source code
COPY . .

# Build all workspace members
RUN cargo build --release --workspace

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built binaries
COPY --from=builder /app/target/release/core-engine ./
COPY --from=builder /app/target/release/database ./
COPY --from=builder /app/target/release/router ./
COPY --from=builder /app/target/release/ws-stream ./

# Copy migration files
COPY --from=builder /app/database/migrations ./migrations/

# Make binaries executable
RUN chmod +x core-engine database router ws-stream

# Expose ports
EXPOSE 8080 8081 8082

# Default command
CMD ["./router"]
