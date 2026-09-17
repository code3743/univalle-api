import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { scrapeNews } from "../services/news-scraper.service.js";
import { deleteNews, listAllNews, setNewsHidden } from "../services/news.service.js";
import { AppError } from "../utils/AppError.js";

const idParamSchema = z.coerce.number().int().positive();

const setHiddenSchema = z.object({
  hidden: z.boolean(),
});

const refreshQuerySchema = z.object({
  pages: z.coerce.number().int().min(1).max(10).default(1),
});

export const adminNewsController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const news = await listAllNews();
      res.json(news);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    let pages: number;
    try {
      pages = refreshQuerySchema.parse(req.query).pages;
    } catch (err) {
      next(err instanceof ZodError ? err : new AppError(400, "Invalid pages parameter"));
      return;
    }

    try {
      const result = await scrapeNews(pages);
      res.json(result);
    } catch (err) {
      console.error("News scrape failed:", err);
      next(new AppError(502, "Failed to scrape news source"));
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idParamSchema.parse(req.params.id);
      const { hidden } = setHiddenSchema.parse(req.body);
      const news = await setNewsHidden(id, hidden);
      res.json(news);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idParamSchema.parse(req.params.id);
      await deleteNews(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
