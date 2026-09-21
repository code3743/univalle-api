import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { getRawConfig, updateConfig } from "../services/config.service.js";

const updateConfigSchema = z.object({
  maintenanceEnabled: z.boolean().optional(),
  maintenanceTitle: z.string().optional(),
  maintenanceMessage: z.string().optional(),
});

export const adminConfigController = {
  async get(_req: Request, res: Response, next: NextFunction) {
    try {
      const config = await getRawConfig();
      res.json(config);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const patch = updateConfigSchema.parse(req.body);
      const config = await updateConfig(patch);
      res.json(config);
    } catch (err) {
      next(err);
    }
  },
};
