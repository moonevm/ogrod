/*
  Warnings:

  - Added the required column `message` to the `WeatherLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WeatherLog" ADD COLUMN     "message" TEXT NOT NULL;
