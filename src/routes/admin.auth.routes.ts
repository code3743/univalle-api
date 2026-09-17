import { Router } from "express";
import rateLimit from "express-rate-limit";
import { adminAuthController } from "../controllers/admin.auth.controller.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

export const adminAuthRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many login attempts, please try again later" });
  },
});

/**
 * @openapi
 * /admin/auth/login:
 *   post:
 *     summary: Login de administrador
 *     tags: [Admin - Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT del administrador
 *       401:
 *         description: Credenciales invalidas
 */
adminAuthRouter.post("/login", loginLimiter, adminAuthController.login);

/**
 * @openapi
 * /admin/auth/me:
 *   get:
 *     summary: Datos del administrador autenticado
 *     tags: [Admin - Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Administrador actual
 *       401:
 *         description: Token invalido o ausente
 */
adminAuthRouter.get("/me", requireAdmin, adminAuthController.me);
