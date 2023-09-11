/*
  Warnings:

  - You are about to drop the column `image` on the `Book` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imageId]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imageId` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "image",
ADD COLUMN     "imageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "bookId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Book_imageId_key" ON "Book"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_bookId_key" ON "Media"("bookId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
