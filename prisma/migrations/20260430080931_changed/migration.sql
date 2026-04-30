-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "latestMessageId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_latestMessageId_key" ON "User"("latestMessageId");
