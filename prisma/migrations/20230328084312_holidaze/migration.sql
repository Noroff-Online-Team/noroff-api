-- CreateTable
CREATE TABLE "HolidazeProfile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,

    CONSTRAINT "HolidazeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HolidazeVenue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "media" TEXT[] DEFAULT ARRAY['https://source.unsplash.com/1600x900/?hotel']::TEXT[],
    "price" DOUBLE PRECISION NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "metaId" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,

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
CREATE TABLE "HolidazeBooking" (
    "id" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL,
    "venueId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,

    CONSTRAINT "HolidazeBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HolidazeProfile_name_key" ON "HolidazeProfile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HolidazeProfile_email_key" ON "HolidazeProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HolidazeVenue_metaId_key" ON "HolidazeVenue"("metaId");

-- AddForeignKey
ALTER TABLE "HolidazeVenue" ADD CONSTRAINT "HolidazeVenue_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "HolidazeVenueMeta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HolidazeVenue" ADD CONSTRAINT "HolidazeVenue_ownerName_fkey" FOREIGN KEY ("ownerName") REFERENCES "HolidazeProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HolidazeBooking" ADD CONSTRAINT "HolidazeBooking_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "HolidazeVenue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HolidazeBooking" ADD CONSTRAINT "HolidazeBooking_customerName_fkey" FOREIGN KEY ("customerName") REFERENCES "HolidazeProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;
