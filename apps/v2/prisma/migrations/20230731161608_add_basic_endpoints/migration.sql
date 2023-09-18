-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "published" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OldGame" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "released" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "genre" TEXT[],

    CONSTRAINT "OldGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NbaTeam" (
    "id" SERIAL NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "conference" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "NbaTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Joke" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "setup" TEXT NOT NULL,
    "punchline" TEXT NOT NULL,

    CONSTRAINT "Joke_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatFact" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "CatFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "tags" TEXT[],
    "authorId" TEXT NOT NULL,
    "authorSlug" TEXT NOT NULL,
    "length" INTEGER NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnlineShopProduct" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "OnlineShopProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnlineShopReview" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "OnlineShopReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- AddForeignKey
ALTER TABLE "OnlineShopReview" ADD CONSTRAINT "OnlineShopReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "OnlineShopProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
