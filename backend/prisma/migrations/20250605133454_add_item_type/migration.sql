/*
  Warnings:

  - You are about to drop the column `type` on the `BuyOrder` table. All the data in the column will be lost.
  - Added the required column `itemType` to the `BuyOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BuyOrder" DROP COLUMN "type",
ADD COLUMN     "itemType" TEXT NOT NULL;
