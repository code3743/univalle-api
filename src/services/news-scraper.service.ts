import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "../config/prisma.js";
import { slugify } from "../utils/slugify.js";

const SOURCE_URL = "https://www.univalle.edu.co/index.php/agencia-de-noticias";
const SITE_ORIGIN = "https://www.univalle.edu.co";
const USER_AGENT = "UnivalleAppBot/1.0 (+https://www.univalle.edu.co)";
const FETCH_TIMEOUT_MS = 15_000;
const ITEMS_PER_PAGE = 21;
const DELAY_BETWEEN_PAGES_MS = 500;

interface ScrapedNewsItem {
  title: string;
  summary: string;
  imageUrl: string | null;
  sourceUrl: string;
  category: string | null;
  categorySlug: string | null;
}

function toAbsoluteUrl(url: string): string {
  return url.startsWith("http") ? url : `${SITE_ORIGIN}${url}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(start: number): Promise<string> {
  const url = start === 0 ? SOURCE_URL : `${SOURCE_URL}?start=${start}`;
  const { data } = await axios.get<string>(url, {
    timeout: FETCH_TIMEOUT_MS,
    headers: { "User-Agent": USER_AGENT },
  });
  return data;
}

export function parseNewsHtml(html: string): ScrapedNewsItem[] {
  const $ = cheerio.load(html);
  const items: ScrapedNewsItem[] = [];

  $(".catItemView").each((_i, el) => {
    const el$ = $(el);
    const titleAnchor = el$.find(".agencia-lst-item-titulo a").first();
    const title = titleAnchor.text().trim();
    const href = titleAnchor.attr("href");
    if (!title || !href) return;

    const summary = el$.find(".agencia-lista-texto").first().text().trim();
    const imageSrc = el$.find(".agencia-lst-img img").first().attr("src");
    const category = el$.find(".agencia-lista-categoria-item").first().text().trim() || null;

    items.push({
      title,
      summary,
      imageUrl: imageSrc ? toAbsoluteUrl(imageSrc) : null,
      sourceUrl: toAbsoluteUrl(href),
      category,
      categorySlug: category ? slugify(category) : null,
    });
  });

  return items;
}

export async function scrapeNews(pages = 1): Promise<{ found: number; upserted: number }> {
  let sourceOrder = 0;
  let found = 0;

  for (let page = 0; page < pages; page++) {
    const html = await fetchPage(page * ITEMS_PER_PAGE);
    const items = parseNewsHtml(html);
    if (items.length === 0) break;

    for (const item of items) {
      await prisma.newsItem.upsert({
        where: { sourceUrl: item.sourceUrl },
        create: { ...item, sourceOrder },
        update: {
          title: item.title,
          summary: item.summary,
          imageUrl: item.imageUrl,
          category: item.category,
          categorySlug: item.categorySlug,
          sourceOrder,
        },
      });
      sourceOrder++;
      found++;
    }

    if (page < pages - 1) await delay(DELAY_BETWEEN_PAGES_MS);
  }

  return { found, upserted: found };
}
