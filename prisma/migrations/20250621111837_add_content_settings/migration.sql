-- CreateTable
CREATE TABLE "ContentSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentSettings_pkey" PRIMARY KEY ("id")
);
