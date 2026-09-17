import { scrapeNews } from "../services/news-scraper.service.js";

const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

async function runScrape() {
  try {
    const { found } = await scrapeNews();
    console.log(`[news-scraper] refreshed, found ${found} items`);
  } catch (err) {
    console.error("[news-scraper] scrape failed:", err);
  }
}

export function startNewsScheduler() {
  void runScrape();
  setInterval(() => void runScrape(), REFRESH_INTERVAL_MS);
}
