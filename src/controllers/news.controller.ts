import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { listCategories, listPublicNews } from "../services/news.service.js";

const newsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.string().optional(),
});

export const newsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, category } = newsQuerySchema.parse(req.query);
      const { items, total } = await listPublicNews(page, limit, category);
      res.set("Cache-Control", "no-cache");
      res.json({
        items: items.map((n) => ({
          id: n.id,
          title: n.title,
          summary: n.summary,
          imageUrl: n.imageUrl,
          sourceUrl: n.sourceUrl,
          category: n.category,
          categorySlug: n.categorySlug,
          scrapedAt: n.scrapedAt,
        })),
        page,
        limit,
        total,
      });
    } catch (err) {
      next(err);
    }
  },

  async listCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await listCategories();
      res.set("Cache-Control", "no-cache");
      res.json(categories);
    } catch (err) {
      next(err);
    }
  },
};
