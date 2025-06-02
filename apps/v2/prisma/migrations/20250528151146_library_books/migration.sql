/*
  Warnings:

  - A unique constraint covering the columns `[libraryBookId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "libraryBookId" TEXT;

-- CreateTable
CREATE TABLE "LibraryBook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "ownerName" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryBookReview" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryBookReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_libraryBookId_key" ON "Media"("libraryBookId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_libraryBookId_fkey" FOREIGN KEY ("libraryBookId") REFERENCES "LibraryBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBook" ADD CONSTRAINT "LibraryBook_ownerName_fkey" FOREIGN KEY ("ownerName") REFERENCES "UserProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBookReview" ADD CONSTRAINT "LibraryBookReview_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "LibraryBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBookReview" ADD CONSTRAINT "LibraryBookReview_reviewerName_fkey" FOREIGN KEY ("reviewerName") REFERENCES "UserProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;
