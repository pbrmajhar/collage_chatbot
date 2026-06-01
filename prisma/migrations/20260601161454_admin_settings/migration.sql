-- CreateEnum
CREATE TYPE "ContentLanguage" AS ENUM ('JA', 'EN');

-- CreateTable
CREATE TABLE "CollegeInfo" (
    "id" TEXT NOT NULL,
    "language" "ContentLanguage" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollegeInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "CollegeInfo_language_isActive_sortOrder_idx" ON "CollegeInfo"("language", "isActive", "sortOrder");
