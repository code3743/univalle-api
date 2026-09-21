import { Router } from "express";
import { adminVersionsController } from "../controllers/admin.versions.controller.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

export const adminVersionsRouter = Router();

adminVersionsRouter.use(requireAdmin);

/**
 * @openapi
 * /admin/versions:
 *   get:
 *     summary: Listar versiones configuradas por plataforma
 *     tags: [Admin - Versions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de versiones (estos valores alimentan el bloque "update" de /app/config)
 */
adminVersionsRouter.get("/", adminVersionsController.list);

/**
 * @openapi
 * /admin/versions/{platform}:
 *   put:
 *     summary: Crear o actualizar la version de una plataforma
 *     tags: [Admin - Versions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ios, android]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [latestVersion, minRequiredVersion, storeUrl]
 *             properties:
 *               latestVersion:
 *                 type: string
 *               minRequiredVersion:
 *                 type: string
 *               storeUrl:
 *                 type: string
 *               updateMessage:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *                 description: Si la plataforma esta habilitada para uso (ej. false mientras no se lanza iOS)
 *     responses:
 *       200:
 *         description: Version creada o actualizada (se refleja en /app/config para esa plataforma)
 */
adminVersionsRouter.put("/:platform", adminVersionsController.upsert);
