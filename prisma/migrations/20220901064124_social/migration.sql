-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "body" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Reaction" (
    "symbol" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("postId","symbol")
);

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
