/*
  Warnings:

  - You are about to drop the column `avatar` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `banner` on the `UserProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userAvatarId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userBannerId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "userAvatarId" INTEGER,
ADD COLUMN     "userBannerId" INTEGER;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "avatar",
DROP COLUMN "banner";

-- CreateIndex
CREATE UNIQUE INDEX "Media_userAvatarId_key" ON "Media"("userAvatarId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_userBannerId_key" ON "Media"("userBannerId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userAvatarId_fkey" FOREIGN KEY ("userAvatarId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_userBannerId_fkey" FOREIGN KEY ("userBannerId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
