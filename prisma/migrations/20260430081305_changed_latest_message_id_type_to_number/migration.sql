/*
  Warnings:

  - Changed the type of `latestMessageId` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "latestMessageId",
ADD COLUMN     "latestMessageId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_latestMessageId_key" ON "User"("latestMessageId");
