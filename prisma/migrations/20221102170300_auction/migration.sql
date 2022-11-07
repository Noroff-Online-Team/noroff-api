/*
  Warnings:

  - The primary key for the `AuctionBid` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "AuctionBid" DROP CONSTRAINT "AuctionBid_pkey",
ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AuctionBid_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AuctionBid_id_seq";
