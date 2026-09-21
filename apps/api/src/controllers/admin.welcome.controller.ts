import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { getRawWelcome, updateWelcome } from "../services/welcome.service.js";

const updateWelcomeSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.url().nullable().optional(),
  linkUrl: z.url().nullable().optional(),
});

export const adminWelcomeController = {
  async get(_req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await getRawWelcome();
      res.json(banner);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const patch = updateWelcomeSchema.parse(req.body);
      const banner = await updateWelcome(patch);
      res.json(banner);
    } catch (err) {
      next(err);
    }
  },
};
