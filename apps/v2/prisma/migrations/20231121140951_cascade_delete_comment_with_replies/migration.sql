-- DropForeignKey
ALTER TABLE "SocialPostComment" DROP CONSTRAINT "SocialPostComment_replyToId_fkey";

-- AddForeignKey
ALTER TABLE "SocialPostComment" ADD CONSTRAINT "SocialPostComment_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "SocialPostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
