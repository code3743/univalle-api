import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { listVersions, upsertVersion } from "../services/version.service.js";

const platformParamSchema = z.enum(["ios", "android"]);

const upsertVersionSchema = z.object({
  latestVersion: z.string().min(1),
  minRequiredVersion: z.string().min(1),
  storeUrl: z.string().min(1),
  updateMessage: z.string().optional(),
  enabled: z.boolean().optional(),
});

function toPlatform(value: z.infer<typeof platformParamSchema>) {
  return value === "ios" ? "IOS" : "ANDROID";
}

export const adminVersionsController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const versions = await listVersions();
      res.json(versions);
    } catch (err) {
      next(err);
    }
  },

  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const platform = platformParamSchema.parse(req.params.platform);
      const data = upsertVersionSchema.parse(req.body);
      const version = await upsertVersion(toPlatform(platform), data);
      res.json(version);
    } catch (err) {
      next(err);
    }
  },
};
