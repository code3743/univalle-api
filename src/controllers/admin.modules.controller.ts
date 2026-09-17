import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  createModule,
  deleteModule,
  listModules,
  updateModule,
} from "../services/modules.service.js";

const keyParamSchema = z.string().min(1);

const createModuleSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().min(1),
  route: z.string().min(1),
  description: z.string().optional(),
  enabledIos: z.boolean().optional(),
  enabledAndroid: z.boolean().optional(),
  quickAccessOrder: z.number().int().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

const updateModuleSchema = createModuleSchema.partial().omit({ key: true });

export const adminModulesController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const modules = await listModules();
      res.json(modules);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createModuleSchema.parse(req.body);
      const module = await createModule(data);
      res.status(201).json(module);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const key = keyParamSchema.parse(req.params.key);
      const patch = updateModuleSchema.parse(req.body);
      const module = await updateModule(key, patch);
      res.json(module);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const key = keyParamSchema.parse(req.params.key);
      await deleteModule(key);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
