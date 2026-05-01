/*
  Warnings:

  - You are about to drop the column `createedAt` on the `WeatherLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WeatherLog" DROP COLUMN "createedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
