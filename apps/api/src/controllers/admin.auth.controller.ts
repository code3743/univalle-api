import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { getAdminById, loginAdmin } from "../services/auth.service.js";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const adminAuthController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await loginAdmin(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await getAdminById(req.admin!.sub);
      res.json(admin);
    } catch (err) {
      next(err);
    }
  },
};
