/*
  Warnings:

  - You are about to drop the column `imageId` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `GameHubProducts` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `OldGame` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `OnlineShopProduct` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `RainyDaysProduct` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `SquareEyesProduct` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[oldGameId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[onlineShopProductId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rainyDaysProductId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameHubProductId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[squareEyesProductId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_imageId_fkey";

-- DropIndex
DROP INDEX "Book_imageId_key";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "imageId";

-- AlterTable
ALTER TABLE "GameHubProducts" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "gameHubProductId" TEXT,
ADD COLUMN     "oldGameId" INTEGER,
ADD COLUMN     "onlineShopProductId" TEXT,
ADD COLUMN     "rainyDaysProductId" TEXT,
ADD COLUMN     "squareEyesProductId" TEXT;

-- AlterTable
ALTER TABLE "OldGame" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "OnlineShopProduct" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "RainyDaysProduct" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "SquareEyesProduct" DROP COLUMN "image";

-- CreateIndex
CREATE UNIQUE INDEX "Media_oldGameId_key" ON "Media"("oldGameId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_onlineShopProductId_key" ON "Media"("onlineShopProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_rainyDaysProductId_key" ON "Media"("rainyDaysProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_gameHubProductId_key" ON "Media"("gameHubProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_squareEyesProductId_key" ON "Media"("squareEyesProductId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_oldGameId_fkey" FOREIGN KEY ("oldGameId") REFERENCES "OldGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_onlineShopProductId_fkey" FOREIGN KEY ("onlineShopProductId") REFERENCES "OnlineShopProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_rainyDaysProductId_fkey" FOREIGN KEY ("rainyDaysProductId") REFERENCES "RainyDaysProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_gameHubProductId_fkey" FOREIGN KEY ("gameHubProductId") REFERENCES "GameHubProducts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_squareEyesProductId_fkey" FOREIGN KEY ("squareEyesProductId") REFERENCES "SquareEyesProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
