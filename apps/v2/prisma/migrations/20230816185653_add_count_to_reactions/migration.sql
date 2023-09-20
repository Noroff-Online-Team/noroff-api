/*
  Warnings:

  - The primary key for the `SocialPostReaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `reactorName` on the `SocialPostReaction` table. All the data in the column will be lost.
  - Added the required column `owner` to the `SocialPostReaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SocialPostReaction" DROP CONSTRAINT "SocialPostReaction_reactorName_fkey";

-- AlterTable
ALTER TABLE "SocialPostReaction" DROP CONSTRAINT "SocialPostReaction_pkey",
DROP COLUMN "reactorName",
ADD COLUMN     "count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "owner" TEXT NOT NULL,
ADD CONSTRAINT "SocialPostReaction_pkey" PRIMARY KEY ("postId", "symbol", "owner");

-- AddForeignKey
ALTER TABLE "SocialPostReaction" ADD CONSTRAINT "SocialPostReaction_owner_fkey" FOREIGN KEY ("owner") REFERENCES "UserProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;
