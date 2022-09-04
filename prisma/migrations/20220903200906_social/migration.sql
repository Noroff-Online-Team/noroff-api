-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "banner" TEXT;

-- CreateTable
CREATE TABLE "_Follows" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Follows_AB_unique" ON "_Follows"("A", "B");

-- CreateIndex
CREATE INDEX "_Follows_B_index" ON "_Follows"("B");

-- AddForeignKey
ALTER TABLE "_Follows" ADD CONSTRAINT "_Follows_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Follows" ADD CONSTRAINT "_Follows_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
