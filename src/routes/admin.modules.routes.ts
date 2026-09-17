import { Router } from "express";
import { adminModulesController } from "../controllers/admin.modules.controller.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

export const adminModulesRouter = Router();

adminModulesRouter.use(requireAdmin);

/**
 * @openapi
 * /admin/modules:
 *   get:
 *     summary: Listar modulos de la app
 *     tags: [Admin - Modules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de modulos
 */
adminModulesRouter.get("/", adminModulesController.list);

/**
 * @openapi
 * /admin/modules:
 *   post:
 *     summary: Crear un nuevo modulo
 *     tags: [Admin - Modules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, label, icon, route]
 *             properties:
 *               key:
 *                 type: string
 *               label:
 *                 type: string
 *               icon:
 *                 type: string
 *               route:
 *                 type: string
 *               description:
 *                 type: string
 *               enabledIos:
 *                 type: boolean
 *               enabledAndroid:
 *                 type: boolean
 *               quickAccessOrder:
 *                 type: integer
 *                 nullable: true
 *                 description: Posicion en la lista de accesos rapidos; null si no es un acceso rapido
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Modulo creado
 */
adminModulesRouter.post("/", adminModulesController.create);

/**
 * @openapi
 * /admin/modules/{key}:
 *   patch:
 *     summary: Actualizar un modulo
 *     tags: [Admin - Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Modulo actualizado
 *       404:
 *         description: Modulo no encontrado
 */
adminModulesRouter.patch("/:key", adminModulesController.update);

/**
 * @openapi
 * /admin/modules/{key}:
 *   delete:
 *     summary: Eliminar un modulo
 *     tags: [Admin - Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Modulo eliminado
 *       404:
 *         description: Modulo no encontrado
 */
adminModulesRouter.delete("/:key", adminModulesController.remove);
