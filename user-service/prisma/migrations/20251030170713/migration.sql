-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('investor', 'creator', 'admin');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USDC', 'SOL', 'ETH', 'BTC');

-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('solana', 'ethereum', 'polygon');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('deposit', 'withdrawal', 'transfer');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'confirmed', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'investor',
    "refresh_token" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_wallets" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_balances" (
    "id" TEXT NOT NULL,
    "balance" DECIMAL(18,9) NOT NULL DEFAULT 0,
    "locked_balance" DECIMAL(18,9) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL,

    CONSTRAINT "user_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposit_addresses" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "chain" "Chain" NOT NULL,
    "currency" "Currency" NOT NULL,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deposit_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT,
    "amount" DECIMAL(18,9) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockchain_hash" TEXT,
    "confirmations" INTEGER,
    "deposit_address_id" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "currency" "Currency" NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_events" (
    "id" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "blockchain_hash" TEXT NOT NULL,
    "block_slot" BIGINT,
    "event_type" TEXT NOT NULL,
    "raw_data" JSONB,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blockchain_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_profiles" (
    "id" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "wallet" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_handle" TEXT NOT NULL,
    "custom_category" TEXT,
    "engagement_metrics" TEXT,
    "full_name" TEXT NOT NULL,
    "funding_goal" DECIMAL(18,2),
    "ico_supply" BIGINT,
    "phone_number" TEXT,
    "profile_picture" TEXT,
    "token_name" TEXT NOT NULL,
    "token_pitch" TEXT NOT NULL,
    "token_symbol" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_token" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "total_supply" BIGINT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_applications" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'pending_submission',
    "rejection_reason" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "content_ownership_declared" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "creator_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_documents" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "creator_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_social_links" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "follower_count" INTEGER,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "creator_social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallets_wallet_address_key" ON "user_wallets"("wallet_address");

-- CreateIndex
CREATE INDEX "user_wallets_user_id_idx" ON "user_wallets"("user_id");

-- CreateIndex
CREATE INDEX "user_balances_user_id_idx" ON "user_balances"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_balances_user_id_currency_key" ON "user_balances"("user_id", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "deposit_addresses_address_key" ON "deposit_addresses"("address");

-- CreateIndex
CREATE INDEX "deposit_addresses_user_id_idx" ON "deposit_addresses"("user_id");

-- CreateIndex
CREATE INDEX "deposit_addresses_chain_idx" ON "deposit_addresses"("chain");

-- CreateIndex
CREATE UNIQUE INDEX "deposit_addresses_user_id_chain_currency_key" ON "deposit_addresses"("user_id", "chain", "currency");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_wallet_id_idx" ON "transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "transactions_deposit_address_id_idx" ON "transactions"("deposit_address_id");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_events_blockchain_hash_key" ON "blockchain_events"("blockchain_hash");

-- CreateIndex
CREATE INDEX "blockchain_events_chain_idx" ON "blockchain_events"("chain");

-- CreateIndex
CREATE INDEX "blockchain_events_blockchain_hash_idx" ON "blockchain_events"("blockchain_hash");

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_wallet_key" ON "creator_profiles"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_creator_handle_key" ON "creator_profiles"("creator_handle");

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_token_symbol_key" ON "creator_profiles"("token_symbol");

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_user_id_key" ON "creator_profiles"("user_id");

-- CreateIndex
CREATE INDEX "creator_profiles_user_id_idx" ON "creator_profiles"("user_id");

-- CreateIndex
CREATE INDEX "creator_profiles_creator_handle_idx" ON "creator_profiles"("creator_handle");

-- CreateIndex
CREATE INDEX "creator_profiles_token_symbol_idx" ON "creator_profiles"("token_symbol");

-- CreateIndex
CREATE UNIQUE INDEX "creator_token_symbol_key" ON "creator_token"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "creator_token_mintAddress_key" ON "creator_token"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "creator_token_user_id_key" ON "creator_token"("user_id");

-- CreateIndex
CREATE INDEX "creator_token_user_id_idx" ON "creator_token"("user_id");

-- CreateIndex
CREATE INDEX "creator_applications_user_id_idx" ON "creator_applications"("user_id");

-- CreateIndex
CREATE INDEX "creator_applications_state_idx" ON "creator_applications"("state");

-- CreateIndex
CREATE INDEX "creator_documents_user_id_idx" ON "creator_documents"("user_id");

-- CreateIndex
CREATE INDEX "creator_documents_status_idx" ON "creator_documents"("status");

-- CreateIndex
CREATE INDEX "creator_social_links_user_id_idx" ON "creator_social_links"("user_id");

-- CreateIndex
CREATE INDEX "verification_logs_user_id_idx" ON "verification_logs"("user_id");

-- CreateIndex
CREATE INDEX "verification_logs_created_at_idx" ON "verification_logs"("created_at");

-- AddForeignKey
ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_balances" ADD CONSTRAINT "user_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit_addresses" ADD CONSTRAINT "deposit_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_deposit_address_id_fkey" FOREIGN KEY ("deposit_address_id") REFERENCES "deposit_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "user_wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_token" ADD CONSTRAINT "creator_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_applications" ADD CONSTRAINT "creator_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_documents" ADD CONSTRAINT "creator_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_social_links" ADD CONSTRAINT "creator_social_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_logs" ADD CONSTRAINT "verification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
