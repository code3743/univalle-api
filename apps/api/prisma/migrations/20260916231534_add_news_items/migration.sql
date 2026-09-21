-- CreateTable
CREATE TABLE "news_items" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "category" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "news_items_sourceUrl_key" ON "news_items"("sourceUrl");

-- CreateIndex
CREATE INDEX "news_items_hidden_scrapedAt_idx" ON "news_items"("hidden", "scrapedAt");
