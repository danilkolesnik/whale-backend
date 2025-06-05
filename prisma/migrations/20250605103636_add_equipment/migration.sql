-- CreateTable
CREATE TABLE "BuyOrder" (
    "id" SERIAL NOT NULL,
    "buyerId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyOrder_pkey" PRIMARY KEY ("id")
);
