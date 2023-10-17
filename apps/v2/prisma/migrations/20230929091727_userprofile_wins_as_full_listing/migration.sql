/*
  Warnings:

  - You are about to drop the column `wins` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuctionListing" ADD COLUMN     "winnerName" TEXT;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "wins";

-- AddForeignKey
ALTER TABLE "AuctionListing" ADD CONSTRAINT "AuctionListing_winnerName_fkey" FOREIGN KEY ("winnerName") REFERENCES "UserProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;
