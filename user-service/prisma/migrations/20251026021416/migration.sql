/*
  Warnings:

  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,chain,currency]` on the table `deposit_addresses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_id_fkey";

-- AlterTable
ALTER TABLE "deposit_addresses" ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."refresh_tokens";

-- CreateIndex
CREATE UNIQUE INDEX "deposit_addresses_user_id_chain_currency_key" ON "deposit_addresses"("user_id", "chain", "currency");
