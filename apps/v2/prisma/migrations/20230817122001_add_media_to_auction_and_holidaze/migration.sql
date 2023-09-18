/*
  Warnings:

  - You are about to drop the column `media` on the `AuctionListing` table. All the data in the column will be lost.
  - You are about to drop the column `media` on the `HolidazeVenue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuctionListing" DROP COLUMN "media";

-- AlterTable
ALTER TABLE "HolidazeVenue" DROP COLUMN "media";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "auctionListingId" TEXT,
ADD COLUMN     "holidazeVenueId" TEXT;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_auctionListingId_fkey" FOREIGN KEY ("auctionListingId") REFERENCES "AuctionListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_holidazeVenueId_fkey" FOREIGN KEY ("holidazeVenueId") REFERENCES "HolidazeVenue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
