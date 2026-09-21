import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  createAnnouncement,
  deleteAnnouncement,
  listAllAnnouncements,
  updateAnnouncement,
} from "../services/announcements.service.js";

const idParamSchema = z.coerce.number().int().positive();

const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.url().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const updateAnnouncementSchema = createAnnouncementSchema.partial();

export const adminAnnouncementsController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const announcements = await listAllAnnouncements();
      res.json(announcements);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createAnnouncementSchema.parse(req.body);
      const announcement = await createAnnouncement(data);
      res.status(201).json(announcement);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idParamSchema.parse(req.params.id);
      const patch = updateAnnouncementSchema.parse(req.body);
      const announcement = await updateAnnouncement(id, patch);
      res.json(announcement);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = idParamSchema.parse(req.params.id);
      await deleteAnnouncement(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
