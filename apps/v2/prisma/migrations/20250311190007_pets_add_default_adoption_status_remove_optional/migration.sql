/*
  Warnings:

  - Made the column `adoptionStatus` on table `Pet` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Pet" ALTER COLUMN "adoptionStatus" SET NOT NULL,
ALTER COLUMN "adoptionStatus" SET DEFAULT 'Available';
