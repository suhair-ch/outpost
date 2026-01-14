/*
  Warnings:

  - You are about to drop the column `totalCommission` on the `Settlement` table. All the data in the column will be lost.
  - Added the required column `netAmountToBePaid` to the `Settlement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCashCollected` to the `Settlement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCommissionEarned` to the `Settlement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Parcel" ADD COLUMN     "settlementId" INTEGER;

-- AlterTable
ALTER TABLE "Settlement" DROP COLUMN "totalCommission",
ADD COLUMN     "netAmountToBePaid" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalCashCollected" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalCommissionEarned" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PAID';

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
