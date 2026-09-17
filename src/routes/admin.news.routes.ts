import { Router } from "express";
import { adminNewsController } from "../controllers/admin.news.controller.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

export const adminNewsRouter = Router();

adminNewsRouter.use(requireAdmin);

/**
 * @openapi
 * /admin/news:
 *   get:
 *     summary: Listar todas las noticias scrapeadas (visibles y ocultas)
 *     tags: [Admin - News]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de noticias
 */
adminNewsRouter.get("/", adminNewsController.list);

/**
 * @openapi
 * /admin/news/refresh:
 *   post:
 *     summary: Disparar el scraping de la agencia de noticias de Univalle ahora mismo
 *     tags: [Admin - News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pages
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *           maximum: 10
 *         description: Cantidad de paginas del listado a recorrer (21 noticias por pagina)
 *     responses:
 *       200:
 *         description: Cantidad de noticias encontradas y guardadas
 *       502:
 *         description: No se pudo scrapear la fuente
 */
adminNewsRouter.post("/refresh", adminNewsController.refresh);

/**
 * @openapi
 * /admin/news/{id}:
 *   patch:
 *     summary: Ocultar o mostrar una noticia en el feed publico
 *     tags: [Admin - News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hidden]
 *             properties:
 *               hidden:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Noticia actualizada
 *       404:
 *         description: Noticia no encontrada
 */
adminNewsRouter.patch("/:id", adminNewsController.update);

/**
 * @openapi
 * /admin/news/{id}:
 *   delete:
 *     summary: Eliminar una noticia
 *     tags: [Admin - News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Noticia eliminada
 *       404:
 *         description: Noticia no encontrada
 */
adminNewsRouter.delete("/:id", adminNewsController.remove);
