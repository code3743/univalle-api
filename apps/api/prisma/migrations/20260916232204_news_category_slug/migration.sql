-- AlterTable
ALTER TABLE "news_items" ADD COLUMN     "categorySlug" TEXT;

-- CreateIndex
CREATE INDEX "news_items_hidden_categorySlug_sourceOrder_idx" ON "news_items"("hidden", "categorySlug", "sourceOrder");
