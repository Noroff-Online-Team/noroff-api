/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `salt` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "passwordHash",
ADD COLUMN     "salt" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_name_key" ON "Profile"("name");
