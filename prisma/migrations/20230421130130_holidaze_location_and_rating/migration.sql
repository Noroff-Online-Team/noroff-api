/*
  Warnings:

  - A unique constraint covering the columns `[locationId]` on the table `HolidazeVenue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `locationId` to the `HolidazeVenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `HolidazeVenue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HolidazeVenue" ADD COLUMN     "locationId" TEXT NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "HolidazeVenueLocation" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT 'Unknown',
    "city" TEXT NOT NULL DEFAULT 'Unknown',
    "zip" TEXT NOT NULL DEFAULT 'Unknown',
    "country" TEXT NOT NULL DEFAULT 'Unknown',
    "continent" TEXT NOT NULL DEFAULT 'Unknown',

    CONSTRAINT "HolidazeVenueLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HolidazeVenue_locationId_key" ON "HolidazeVenue"("locationId");

-- AddForeignKey
ALTER TABLE "HolidazeVenue" ADD CONSTRAINT "HolidazeVenue_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "HolidazeVenueLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
