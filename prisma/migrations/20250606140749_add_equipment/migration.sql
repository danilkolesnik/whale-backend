-- CreateTable
CREATE TABLE "RechargeHistory" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "valueCoin" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RechargeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RechargeHistory_userId_idx" ON "RechargeHistory"("userId");
