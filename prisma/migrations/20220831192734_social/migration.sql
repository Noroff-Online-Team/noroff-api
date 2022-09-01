-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "media" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "avatar" TEXT;
