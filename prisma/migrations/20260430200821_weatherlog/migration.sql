/*
  Warnings:

  - Added the required column `userId` to the `WeatherLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WeatherLog" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "WeatherLog" ADD CONSTRAINT "WeatherLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
