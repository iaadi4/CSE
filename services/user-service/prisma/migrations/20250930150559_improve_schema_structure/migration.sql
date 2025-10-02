/*
  Warnings:

  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_wallet_id_fkey";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "bio",
DROP COLUMN "preferences";

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "public"."sessions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "public"."transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_wallet_id_idx" ON "public"."transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "user_balances_user_id_idx" ON "public"."user_balances"("user_id");

-- CreateIndex
CREATE INDEX "user_balances_wallet_id_idx" ON "public"."user_balances"("wallet_id");

-- CreateIndex
CREATE INDEX "user_wallets_user_id_idx" ON "public"."user_wallets"("user_id");

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "public"."user_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
