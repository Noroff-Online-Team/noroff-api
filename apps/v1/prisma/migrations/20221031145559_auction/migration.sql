/*
  Warnings:

  - You are about to drop the column `bidderId` on the `AuctionBid` table. All the data in the column will be lost.
  - Added the required column `bidderName` to the `AuctionBid` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AuctionBid" DROP CONSTRAINT "AuctionBid_bidderId_fkey";

-- AlterTable
ALTER TABLE "AuctionBid" DROP COLUMN "bidderId",
ADD COLUMN     "bidderName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AuctionBid" ADD CONSTRAINT "AuctionBid_bidderName_fkey" FOREIGN KEY ("bidderName") REFERENCES "AuctionProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;
