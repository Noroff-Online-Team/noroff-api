/*
  Warnings:

  - Added the required column `created` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "created" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated" TIMESTAMP(3) NOT NULL;
