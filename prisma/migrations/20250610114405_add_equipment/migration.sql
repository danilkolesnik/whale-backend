-- AlterTable
ALTER TABLE "User" ADD COLUMN     "friends" JSONB NOT NULL DEFAULT '[]';
