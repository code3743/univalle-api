import { Router } from "express";
import { adminAnnouncementsController } from "../controllers/admin.announcements.controller.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

export const adminAnnouncementsRouter = Router();

adminAnnouncementsRouter.use(requireAdmin);

/**
 * @openapi
 * /admin/announcements:
 *   get:
 *     summary: Listar todas las novedades (activas e inactivas)
 *     tags: [Admin - Announcements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de novedades
 */
adminAnnouncementsRouter.get("/", adminAnnouncementsController.list);

/**
 * @openapi
 * /admin/announcements:
 *   post:
 *     summary: Crear una novedad
 *     tags: [Admin - Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               active:
 *                 type: boolean
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Novedad creada
 */
adminAnnouncementsRouter.post("/", adminAnnouncementsController.create);

/**
 * @openapi
 * /admin/announcements/{id}:
 *   patch:
 *     summary: Actualizar una novedad
 *     tags: [Admin - Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Novedad actualizada
 *       404:
 *         description: Novedad no encontrada
 */
adminAnnouncementsRouter.patch("/:id", adminAnnouncementsController.update);

/**
 * @openapi
 * /admin/announcements/{id}:
 *   delete:
 *     summary: Eliminar una novedad
 *     tags: [Admin - Announcements]
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
 *         description: Novedad eliminada
 *       404:
 *         description: Novedad no encontrada
 */
adminAnnouncementsRouter.delete("/:id", adminAnnouncementsController.remove);
