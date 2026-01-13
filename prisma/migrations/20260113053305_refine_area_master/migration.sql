/*
  Warnings:

  - A unique constraint covering the columns `[shopCode]` on the table `Shop` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopCode` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AreaSource" AS ENUM ('INDIA_POST', 'CENSUS', 'EC');

-- AlterTable
ALTER TABLE "Parcel" ADD COLUMN     "destinationArea" TEXT;

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "area" TEXT,
ADD COLUMN     "shopCode" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "pincode" TEXT,
    "state" TEXT NOT NULL DEFAULT 'Kerala',
    "source" "AreaSource" NOT NULL DEFAULT 'INDIA_POST',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Area_district_idx" ON "Area"("district");

-- CreateIndex
CREATE UNIQUE INDEX "Area_normalizedName_district_key" ON "Area"("normalizedName", "district");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shopCode_key" ON "Shop"("shopCode");
