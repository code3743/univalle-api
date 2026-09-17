import { Router } from "express";
import { adminAnnouncementsRouter } from "./admin.announcements.routes.js";
import { adminAuthRouter } from "./admin.auth.routes.js";
import { adminConfigRouter } from "./admin.config.routes.js";
import { adminModulesRouter } from "./admin.modules.routes.js";
import { adminNewsRouter } from "./admin.news.routes.js";
import { adminVersionsRouter } from "./admin.versions.routes.js";
import { adminWelcomeRouter } from "./admin.welcome.routes.js";
import { appRouter } from "./app.routes.js";

export const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is up
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/app", appRouter);
router.use("/admin/auth", adminAuthRouter);
router.use("/admin/config", adminConfigRouter);
router.use("/admin/welcome", adminWelcomeRouter);
router.use("/admin/versions", adminVersionsRouter);
router.use("/admin/modules", adminModulesRouter);
router.use("/admin/announcements", adminAnnouncementsRouter);
router.use("/admin/news", adminNewsRouter);
