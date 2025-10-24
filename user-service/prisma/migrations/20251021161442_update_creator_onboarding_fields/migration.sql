/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `creator_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `banner_url` on the `creator_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `creator_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `display_name` on the `creator_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `creator_profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[creator_handle]` on the table `creator_profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token_symbol]` on the table `creator_profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creator_handle` to the `creator_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `creator_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ico_supply` to the `creator_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_name` to the `creator_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_pitch` to the `creator_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_symbol` to the `creator_profiles` table without a default value. This is not possible if the table is not empty.
  - Made the column `bio` on table `creator_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category` on table `creator_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."creator_applications" ADD COLUMN     "content_ownership_declared" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."creator_profiles" DROP COLUMN "avatar_url",
DROP COLUMN "banner_url",
DROP COLUMN "country",
DROP COLUMN "display_name",
DROP COLUMN "website",
ADD COLUMN     "creator_handle" TEXT NOT NULL,
ADD COLUMN     "custom_category" TEXT,
ADD COLUMN     "engagement_metrics" TEXT,
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "funding_goal" DECIMAL(18,2),
ADD COLUMN     "ico_supply" DECIMAL(18,2) NOT NULL,
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "profile_picture" TEXT,
ADD COLUMN     "token_name" TEXT NOT NULL,
ADD COLUMN     "token_pitch" TEXT NOT NULL,
ADD COLUMN     "token_symbol" TEXT NOT NULL,
ALTER COLUMN "bio" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."creator_social_links" ADD COLUMN     "follower_count" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_creator_handle_key" ON "public"."creator_profiles"("creator_handle");

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_token_symbol_key" ON "public"."creator_profiles"("token_symbol");

-- CreateIndex
CREATE INDEX "creator_profiles_creator_handle_idx" ON "public"."creator_profiles"("creator_handle");

-- CreateIndex
CREATE INDEX "creator_profiles_token_symbol_idx" ON "public"."creator_profiles"("token_symbol");
