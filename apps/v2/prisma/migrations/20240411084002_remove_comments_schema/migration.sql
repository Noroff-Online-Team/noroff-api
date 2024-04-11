/*
  Warnings:

  - You are about to drop the `BlogPostComment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlogPostComment" DROP CONSTRAINT "BlogPostComment_owner_fkey";

-- DropForeignKey
ALTER TABLE "BlogPostComment" DROP CONSTRAINT "BlogPostComment_postId_fkey";

-- DropForeignKey
ALTER TABLE "BlogPostComment" DROP CONSTRAINT "BlogPostComment_replyToId_fkey";

-- DropTable
DROP TABLE "BlogPostComment";
