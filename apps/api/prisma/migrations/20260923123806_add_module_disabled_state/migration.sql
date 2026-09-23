-- AlterTable
ALTER TABLE "app_modules" ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "disabledMessage" TEXT;
