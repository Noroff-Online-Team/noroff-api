/*
  Warnings:

  - You are about to drop the column `dateAdded` on the `Pet` table. All the data in the column will be lost.
  - Added the required column `updated` to the `Pet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "dateAdded",
ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated" TIMESTAMP(3) NOT NULL;
