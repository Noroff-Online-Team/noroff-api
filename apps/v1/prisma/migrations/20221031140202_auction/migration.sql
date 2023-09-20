/*
  Warnings:

  - You are about to drop the column `image` on the `AuctionListing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuctionListing" DROP COLUMN "image",
ADD COLUMN     "media" TEXT[],
ALTER COLUMN "description" DROP NOT NULL;
