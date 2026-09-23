import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  createModule,
  deleteModule,
  listModules,
  updateModule,
} from "../services/modules.service.js";

const keyParamSchema = z.string().min(1);

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "color must be a #RRGGBB hex string");

const baseModuleSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().min(1),
  route: z.string().min(1),
  color: hexColorSchema,
  description: z.string().optional(),
  enabledIos: z.boolean().optional(),
  enabledAndroid: z.boolean().optional(),
  disabled: z.boolean().optional(),
  disabledMessage: z.string().min(1).optional(),
  quickAccessOrder: z.number().int().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

const withDisabledMessageRequired = (
  data: { disabled?: boolean; disabledMessage?: string },
  ctx: z.RefinementCtx,
) => {
  if (data.disabled && !data.disabledMessage) {
    ctx.addIssue({
      code: "custom",
      message: "disabledMessage is required when disabled is true",
      path: ["disabledMessage"],
    });
  }
};

const createModuleSchema = baseModuleSchema.superRefine(withDisabledMessageRequired);

const updateModuleSchema = baseModuleSchema
  .partial()
  .omit({ key: true })
  .superRefine(withDisabledMessageRequired);

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
