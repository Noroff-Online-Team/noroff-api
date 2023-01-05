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

-- AddForeignKey
ALTER TABLE "OnlineShopReview" ADD CONSTRAINT "OnlineShopReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "OnlineShopProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
