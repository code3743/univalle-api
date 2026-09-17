import { Router } from "express";
import { adminWelcomeController } from "../controllers/admin.welcome.controller.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

export const adminWelcomeRouter = Router();

adminWelcomeRouter.use(requireAdmin);

/**
 * @openapi
 * /admin/welcome:
 *   get:
 *     summary: Obtener el banner de bienvenida
 *     tags: [Admin - Welcome]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Banner actual
 */
adminWelcomeRouter.get("/", adminWelcomeController.get);

/**
 * @openapi
 * /admin/welcome:
 *   patch:
 *     summary: Actualizar el banner de bienvenida (titulo, descripcion, imagen, enlace)
 *     tags: [Admin - Welcome]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *               linkUrl:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Banner actualizado
 */
adminWelcomeRouter.patch("/", adminWelcomeController.update);
