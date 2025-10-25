/*
  Warnings:

  - You are about to drop the column `tx_signature` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `wallet_id` on the `user_balances` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `refresh_token` on the `users` table. All the data in the column will be lost.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[user_id,currency]` on the table `user_balances` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `user_id` on the `creator_applications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `creator_documents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `creator_profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `creator_social_links` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updated_at` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `user_id` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `currency` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `user_balances` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `currency` on the `user_balances` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `user_wallets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - The required column `uuid` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Changed the type of `user_id` on the `verification_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('investor', 'creator', 'admin');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USDC');

-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('solana', 'ethereum', 'polygon');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('deposit', 'withdrawal', 'transfer');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'confirmed', 'failed');

-- DropForeignKey
ALTER TABLE "public"."creator_applications" DROP CONSTRAINT "creator_applications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."creator_documents" DROP CONSTRAINT "creator_documents_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."creator_profiles" DROP CONSTRAINT "creator_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."creator_social_links" DROP CONSTRAINT "creator_social_links_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_balances" DROP CONSTRAINT "user_balances_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_balances" DROP CONSTRAINT "user_balances_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_wallets" DROP CONSTRAINT "user_wallets_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."verification_logs" DROP CONSTRAINT "verification_logs_user_id_fkey";

-- DropIndex
DROP INDEX "public"."user_balances_user_id_wallet_id_currency_key";

-- DropIndex
DROP INDEX "public"."user_balances_wallet_id_idx";

-- AlterTable
ALTER TABLE "creator_applications" DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "creator_documents" DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "creator_profiles" DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "creator_social_links" DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "tx_signature",
ADD COLUMN     "blockchain_hash" TEXT,
ADD COLUMN     "confirmations" INTEGER,
ADD COLUMN     "deposit_address_id" TEXT,
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "wallet_id" DROP NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "TransactionType" NOT NULL,
DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL;

-- AlterTable
ALTER TABLE "user_balances" DROP COLUMN "wallet_id",
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
DROP COLUMN "currency",
ADD COLUMN     "currency" "Currency" NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_wallets" DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "is_active" SET DEFAULT true;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "refresh_token",
ADD COLUMN     "uuid" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'investor',
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "verification_logs" DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposit_addresses" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "chain" "Chain" NOT NULL,
    "currency" "Currency" NOT NULL,
    "address" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deposit_addresses_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "deposit_addresses_address_key" ON "deposit_addresses"("address");

-- CreateIndex
CREATE INDEX "deposit_addresses_user_id_idx" ON "deposit_addresses"("user_id");

-- CreateIndex
CREATE INDEX "deposit_addresses_chain_idx" ON "deposit_addresses"("chain");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_events_blockchain_hash_key" ON "blockchain_events"("blockchain_hash");

-- CreateIndex
CREATE INDEX "blockchain_events_chain_idx" ON "blockchain_events"("chain");

-- CreateIndex
CREATE INDEX "blockchain_events_blockchain_hash_idx" ON "blockchain_events"("blockchain_hash");

-- CreateIndex
CREATE INDEX "creator_applications_user_id_idx" ON "creator_applications"("user_id");

-- CreateIndex
CREATE INDEX "creator_documents_user_id_idx" ON "creator_documents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_user_id_key" ON "creator_profiles"("user_id");

-- CreateIndex
CREATE INDEX "creator_profiles_user_id_idx" ON "creator_profiles"("user_id");

-- CreateIndex
CREATE INDEX "creator_social_links_user_id_idx" ON "creator_social_links"("user_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_deposit_address_id_idx" ON "transactions"("deposit_address_id");

-- CreateIndex
CREATE INDEX "user_balances_user_id_idx" ON "user_balances"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_balances_user_id_currency_key" ON "user_balances"("user_id", "currency");

-- CreateIndex
CREATE INDEX "user_wallets_user_id_idx" ON "user_wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE INDEX "verification_logs_user_id_idx" ON "verification_logs"("user_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_balances" ADD CONSTRAINT "user_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit_addresses" ADD CONSTRAINT "deposit_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "user_wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_deposit_address_id_fkey" FOREIGN KEY ("deposit_address_id") REFERENCES "deposit_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_applications" ADD CONSTRAINT "creator_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_documents" ADD CONSTRAINT "creator_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_social_links" ADD CONSTRAINT "creator_social_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_logs" ADD CONSTRAINT "verification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
