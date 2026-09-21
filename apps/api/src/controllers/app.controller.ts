import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { listAnnouncements } from "../services/announcements.service.js";
import { getAppConfig } from "../services/config.service.js";
import { listPublicModules } from "../services/modules.service.js";
import { getRawWelcome } from "../services/welcome.service.js";

const platformParamSchema = z.enum(["ios", "android"]);

const appConfigQuerySchema = z.object({
  platform: platformParamSchema,
  version: z.string().optional(),
});

const modulesQuerySchema = z.object({
  platform: platformParamSchema,
});

const announcementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

function toPlatform(value: z.infer<typeof platformParamSchema>) {
  return value === "ios" ? "IOS" : "ANDROID";
}

export const appController = {
  async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { platform, version } = appConfigQuerySchema.parse(req.query);
      const config = await getAppConfig(toPlatform(platform), version);
      res.set("Cache-Control", "no-cache");
      res.json(config);
    } catch (err) {
      next(err);
    }
  },

  async getModules(req: Request, res: Response, next: NextFunction) {
    try {
      const { platform } = modulesQuerySchema.parse(req.query);
      const { items, quickAccess } = await listPublicModules(toPlatform(platform));
      res.set("Cache-Control", "no-cache");
      res.json({ items, quickAccess });
    } catch (err) {
      next(err);
    }
  },

  async getAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = announcementsQuerySchema.parse(req.query);
      const { items, total } = await listAnnouncements(page, limit);
      res.set("Cache-Control", "no-cache");
      res.json({
        items: items.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          imageUrl: a.imageUrl,
        })),
        page,
        limit,
        total,
      });
    } catch (err) {
      next(err);
    }
  },

  async getWelcome(_req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await getRawWelcome();
      res.set("Cache-Control", "no-cache");
      res.json({
        enabled: banner.enabled,
        title: banner.title,
        description: banner.description,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
      });
    } catch (err) {
      next(err);
    }
  },
};
