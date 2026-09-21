import { Router } from "express";
import { appController } from "../controllers/app.controller.js";

export const appRouter = Router();

/**
 * @openapi
 * /app/config:
 *   get:
 *     summary: Snapshot de configuracion para el arranque de la app mobile
 *     tags: [App]
 *     parameters:
 *       - in: query
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ios, android]
 *       - in: query
 *         name: version
 *         required: false
 *         schema:
 *           type: string
 *         description: Version actual del cliente, ej. 2.1.0
 *     responses:
 *       200:
 *         description: Mantenimiento y estado de actualizacion vigentes para la plataforma indicada
 */
appRouter.get("/config", appController.getConfig);

/**
 * @openapi
 * /app/modules:
 *   get:
 *     summary: Modulos habilitados para la plataforma indicada
 *     tags: [App]
 *     parameters:
 *       - in: query
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ios, android]
 *     responses:
 *       200:
 *         description: Lista de modulos habilitados y orden de accesos rapidos
 */
appRouter.get("/modules", appController.getModules);

/**
 * @openapi
 * /app/announcements:
 *   get:
 *     summary: Feed paginado de novedades activas
 *     tags: [App]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de novedades activas
 */
appRouter.get("/announcements", appController.getAnnouncements);

/**
 * @openapi
 * /app/welcome:
 *   get:
 *     summary: Banner de bienvenida vigente
 *     tags: [App]
 *     responses:
 *       200:
 *         description: Banner de bienvenida actual
 */
appRouter.get("/welcome", appController.getWelcome);
