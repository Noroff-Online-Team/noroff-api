-- CreateTable
CREATE TABLE "RainyDaysProduct" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "sizes" TEXT[],
    "baseColor" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION NOT NULL,
    "onSale" BOOLEAN NOT NULL,
    "image" TEXT NOT NULL,
    "tags" TEXT[],
    "favorite" BOOLEAN NOT NULL,

    CONSTRAINT "RainyDaysProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameHubProducts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "released" TEXT NOT NULL,
    "ageRating" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION NOT NULL,
    "onSale" BOOLEAN NOT NULL,
    "image" TEXT NOT NULL,
    "tags" TEXT[],
    "favorite" BOOLEAN NOT NULL,

    CONSTRAINT "GameHubProducts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquareEyesProduct" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "released" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION NOT NULL,
    "onSale" BOOLEAN NOT NULL,
    "image" TEXT NOT NULL,
    "tags" TEXT[],
    "favorite" BOOLEAN NOT NULL,

    CONSTRAINT "SquareEyesProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "banner" TEXT,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 1000,
    "wins" TEXT[],
    "venueManager" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "tags" TEXT[],
    "media" TEXT,
    "owner" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPostReaction" (
    "symbol" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "SocialPostReaction_pkey" PRIMARY KEY ("postId","symbol")
);

-- CreateTable
CREATE TABLE "SocialPostComment" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL,
    "replyToId" INTEGER,

    CONSTRAINT "SocialPostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionListing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "media" TEXT[],
    "tags" TEXT[],
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "sellerName" TEXT NOT NULL,

    CONSTRAINT "AuctionListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionBid" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "bidderName" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HolidazeVenue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "media" TEXT[] DEFAULT ARRAY['https://source.unsplash.com/1600x900/?hotel']::TEXT[],
    "price" DOUBLE PRECISION NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metaId" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "HolidazeVenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HolidazeVenueMeta" (
    "id" TEXT NOT NULL,
    "wifi" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "breakfast" BOOLEAN NOT NULL DEFAULT false,
    "pets" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HolidazeVenueMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HolidazeVenueLocation" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT 'Unknown',
    "city" TEXT NOT NULL DEFAULT 'Unknown',
    "zip" TEXT NOT NULL DEFAULT 'Unknown',
    "country" TEXT NOT NULL DEFAULT 'Unknown',
    "continent" TEXT NOT NULL DEFAULT 'Unknown',
    "lat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lng" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "HolidazeVenueLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HolidazeBooking" (
    "id" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "venueId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,

    CONSTRAINT "HolidazeBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Follows" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_name_key" ON "UserProfile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HolidazeVenue_metaId_key" ON "HolidazeVenue"("metaId");

-- CreateIndex
CREATE UNIQUE INDEX "HolidazeVenue_locationId_key" ON "HolidazeVenue"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "_Follows_AB_unique" ON "_Follows"("A", "B");

-- CreateIndex
CREATE INDEX "_Follows_B_index" ON "_Follows"("B");

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_owner_fkey" FOREIGN KEY ("owner") REFERENCES "UserProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPostReaction" ADD CONSTRAINT "SocialPostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPostComment" ADD CONSTRAINT "SocialPostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPostComment" ADD CONSTRAINT "SocialPostComment_owner_fkey" FOREIGN KEY ("owner") REFERENCES "UserProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPostComment" ADD CONSTRAINT "SocialPostComment_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "SocialPostComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionListing" ADD CONSTRAINT "AuctionListing_sellerName_fkey" FOREIGN KEY ("sellerName") REFERENCES "UserProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionBid" ADD CONSTRAINT "AuctionBid_bidderName_fkey" FOREIGN KEY ("bidderName") REFERENCES "UserProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionBid" ADD CONSTRAINT "AuctionBid_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "AuctionListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HolidazeVenue" ADD CONSTRAINT "HolidazeVenue_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "HolidazeVenueMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HolidazeVenue" ADD CONSTRAINT "HolidazeVenue_ownerName_fkey" FOREIGN KEY ("ownerName") REFERENCES "UserProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HolidazeVenue" ADD CONSTRAINT "HolidazeVenue_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "HolidazeVenueLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HolidazeBooking" ADD CONSTRAINT "HolidazeBooking_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "HolidazeVenue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HolidazeBooking" ADD CONSTRAINT "HolidazeBooking_customerName_fkey" FOREIGN KEY ("customerName") REFERENCES "UserProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Follows" ADD CONSTRAINT "_Follows_A_fkey" FOREIGN KEY ("A") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Follows" ADD CONSTRAINT "_Follows_B_fkey" FOREIGN KEY ("B") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
