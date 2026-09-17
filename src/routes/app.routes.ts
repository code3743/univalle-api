import { Router } from "express";
import { appController } from "../controllers/app.controller.js";
import { newsController } from "../controllers/news.controller.js";

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
 *         description: Configuracion vigente para la plataforma indicada
 */
appRouter.get("/config", appController.getConfig);

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

/**
 * @openapi
 * /app/news:
 *   get:
 *     summary: Feed paginado de noticias de Univalle (scrapeadas de la agencia de noticias)
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
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar por categorySlug, ej. arte-y-cultura
 *     responses:
 *       200:
 *         description: Lista de noticias visibles
 */
appRouter.get("/news", newsController.list);

/**
 * @openapi
 * /app/news/categories:
 *   get:
 *     summary: Listar las categorias de noticias disponibles actualmente
 *     tags: [App]
 *     responses:
 *       200:
 *         description: Categorias con su slug, etiqueta y cantidad de noticias
 */
appRouter.get("/news/categories", newsController.listCategories);
