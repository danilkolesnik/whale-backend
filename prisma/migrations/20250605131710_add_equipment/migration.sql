/*
  Warnings:

  - You are about to drop the column `itemType` on the `BuyOrder` table. All the data in the column will be lost.
  - Added the required column `type` to the `BuyOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BuyOrder" DROP COLUMN "itemType",
ADD COLUMN     "type" TEXT NOT NULL;
