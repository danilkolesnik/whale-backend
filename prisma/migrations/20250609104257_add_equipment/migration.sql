/*
  Warnings:

  - You are about to drop the column `displayName` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `shield` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `telegramId` on the `Rating` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Rating_telegramId_key";

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "displayName",
DROP COLUMN "shield",
DROP COLUMN "telegramId",
ADD COLUMN     "roundCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "users" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "telegramId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "walletNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "messageId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_telegramId_idx" ON "Transaction"("telegramId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
