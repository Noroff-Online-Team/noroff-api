-- CreateTable
CREATE TABLE "RainyDaysProduct" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "sizes" TEXT[],
    "baseColor" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION NOT NULL,
    "onSale" BOOLEAN NOT NULL,
    "image" TEXT NOT NULL,
    "tags" TEXT[],
    "favorite" BOOLEAN NOT NULL,

    CONSTRAINT "RainyDaysProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameHubProducts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "released" TEXT NOT NULL,
    "ageRating" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION NOT NULL,
    "onSale" BOOLEAN NOT NULL,
    "image" TEXT NOT NULL,
    "tags" TEXT[],
    "favorite" BOOLEAN NOT NULL,

    CONSTRAINT "GameHubProducts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquareEyesProduct" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "released" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION NOT NULL,
    "onSale" BOOLEAN NOT NULL,
    "image" TEXT NOT NULL,
    "tags" TEXT[],
    "favorite" BOOLEAN NOT NULL,

    CONSTRAINT "SquareEyesProduct_pkey" PRIMARY KEY ("id")
);
