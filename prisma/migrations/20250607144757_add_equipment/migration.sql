-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "displayName" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "shield" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_telegramId_key" ON "Rating"("telegramId");
