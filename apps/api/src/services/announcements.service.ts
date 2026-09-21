import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export interface CreateAnnouncementInput {
  title: string;
  description: string;
  imageUrl?: string;
  active?: boolean;
  sortOrder?: number;
}

export type UpdateAnnouncementInput = Partial<CreateAnnouncementInput>;

export function listAllAnnouncements() {
  return prisma.announcement.findMany({ orderBy: { sortOrder: "asc" } });
}

export function createAnnouncement(data: CreateAnnouncementInput) {
  return prisma.announcement.create({ data });
}

export async function updateAnnouncement(id: number, patch: UpdateAnnouncementInput) {
  const exists = await prisma.announcement.findUnique({ where: { id } });
  if (!exists) throw new AppError(404, `Announcement ${id} not found`);
  return prisma.announcement.update({ where: { id }, data: patch });
}

export async function deleteAnnouncement(id: number) {
  const exists = await prisma.announcement.findUnique({ where: { id } });
  if (!exists) throw new AppError(404, `Announcement ${id} not found`);
  await prisma.announcement.delete({ where: { id } });
}

export async function listAnnouncements(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      skip,
      take: limit,
    }),
    prisma.announcement.count({ where: { active: true } }),
  ]);

  return { items, total };
}
