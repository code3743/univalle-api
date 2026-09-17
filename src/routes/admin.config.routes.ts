import { Router } from "express";
import { adminConfigController } from "../controllers/admin.config.controller.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

export const adminConfigRouter = Router();

adminConfigRouter.use(requireAdmin);

/**
 * @openapi
 * /admin/config:
 *   get:
 *     summary: Obtener configuracion de mantenimiento y bienvenida
 *     tags: [Admin - Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuracion actual
 */
adminConfigRouter.get("/", adminConfigController.get);

/**
 * @openapi
 * /admin/config:
 *   patch:
 *     summary: Actualizar configuracion de mantenimiento y bienvenida
 *     tags: [Admin - Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maintenanceEnabled:
 *                 type: boolean
 *               maintenanceTitle:
 *                 type: string
 *               maintenanceMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Configuracion actualizada
 */
adminConfigRouter.patch("/", adminConfigController.update);
