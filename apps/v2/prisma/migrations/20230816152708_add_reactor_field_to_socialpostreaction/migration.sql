/*
  Warnings:

  - The primary key for the `SocialPostReaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `count` on the `SocialPostReaction` table. All the data in the column will be lost.
  - Added the required column `reactorName` to the `SocialPostReaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SocialPostReaction" DROP CONSTRAINT "SocialPostReaction_pkey",
DROP COLUMN "count",
ADD COLUMN     "reactorName" TEXT NOT NULL,
ADD CONSTRAINT "SocialPostReaction_pkey" PRIMARY KEY ("postId", "symbol", "reactorName");

-- AddForeignKey
ALTER TABLE "SocialPostReaction" ADD CONSTRAINT "SocialPostReaction_reactorName_fkey" FOREIGN KEY ("reactorName") REFERENCES "UserProfile"("name") ON DELETE CASCADE ON UPDATE CASCADE;
