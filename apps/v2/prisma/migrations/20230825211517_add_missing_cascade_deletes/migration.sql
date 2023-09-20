-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_auctionListingId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_holidazeVenueId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_socialPostId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_userAvatarId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_userBannerId_fkey";

-- DropForeignKey
ALTER TABLE "OnlineShopReview" DROP CONSTRAINT "OnlineShopReview_productId_fkey";

-- AddForeignKey
ALTER TABLE "OnlineShopReview" ADD CONSTRAINT "OnlineShopReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "OnlineShopProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_auctionListingId_fkey" FOREIGN KEY ("auctionListingId") REFERENCES "AuctionListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_holidazeVenueId_fkey" FOREIGN KEY ("holidazeVenueId") REFERENCES "HolidazeVenue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userAvatarId_fkey" FOREIGN KEY ("userAvatarId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userBannerId_fkey" FOREIGN KEY ("userBannerId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
