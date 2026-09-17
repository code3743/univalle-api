-- DropIndex
DROP INDEX "news_items_hidden_scrapedAt_idx";

-- AlterTable
ALTER TABLE "news_items" ADD COLUMN     "sourceOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "news_items_hidden_sourceOrder_idx" ON "news_items"("hidden", "sourceOrder");
