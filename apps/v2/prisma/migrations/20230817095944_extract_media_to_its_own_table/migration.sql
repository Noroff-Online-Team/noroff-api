/*
  Warnings:

  - You are about to drop the column `media` on the `SocialPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SocialPost" DROP COLUMN "media",
ADD COLUMN     "mediaId" TEXT;

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "socialPostId" INTEGER,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_socialPostId_key" ON "Media"("socialPostId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "SocialPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
