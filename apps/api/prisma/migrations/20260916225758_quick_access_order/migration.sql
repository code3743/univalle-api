-- Replace the boolean quick-access flag with an explicit, independently orderable position.
ALTER TABLE "app_modules" ADD COLUMN "quickAccessOrder" INTEGER;
UPDATE "app_modules" SET "quickAccessOrder" = "sortOrder" WHERE "isQuickAccess" = true;
ALTER TABLE "app_modules" DROP COLUMN "isQuickAccess";
