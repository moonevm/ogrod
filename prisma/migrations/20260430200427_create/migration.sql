-- CreateTable
CREATE TABLE "WeatherLog" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "weatherData" JSONB NOT NULL,
    "createedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherLog_pkey" PRIMARY KEY ("id")
);
