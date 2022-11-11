/*
  Warnings:

  - You are about to drop the column `sellerId` on the `AuctionListing` table. All the data in the column will be lost.
  - Added the required column `sellerName` to the `AuctionListing` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AuctionListing" DROP CONSTRAINT "AuctionListing_sellerId_fkey";

-- AlterTable
ALTER TABLE "AuctionListing" DROP COLUMN "sellerId",
ADD COLUMN     "sellerName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AuctionListing" ADD CONSTRAINT "AuctionListing_sellerName_fkey" FOREIGN KEY ("sellerName") REFERENCES "AuctionProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;
