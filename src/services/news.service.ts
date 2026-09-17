import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export async function listPublicNews(page: number, limit: number, categorySlug?: string) {
  const skip = (page - 1) * limit;
  const where = { hidden: false, ...(categorySlug ? { categorySlug } : {}) };

  const [items, total] = await prisma.$transaction([
    prisma.newsItem.findMany({
      where,
      orderBy: { sourceOrder: "asc" },
      skip,
      take: limit,
    }),
    prisma.newsItem.count({ where }),
  ]);

  return { items, total };
}

export function listAllNews() {
  return prisma.newsItem.findMany({ orderBy: { sourceOrder: "asc" } });
}

export async function listCategories() {
  const grouped = await prisma.newsItem.groupBy({
    by: ["categorySlug", "category"],
    where: { hidden: false, categorySlug: { not: null } },
    _count: { _all: true },
  });

  return grouped
    .map((g) => ({
      slug: g.categorySlug as string,
      label: g.category as string,
      count: g._count._all,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function setNewsHidden(id: number, hidden: boolean) {
  const exists = await prisma.newsItem.findUnique({ where: { id } });
  if (!exists) throw new AppError(404, `News item ${id} not found`);
  return prisma.newsItem.update({ where: { id }, data: { hidden } });
}

export async function deleteNews(id: number) {
  const exists = await prisma.newsItem.findUnique({ where: { id } });
  if (!exists) throw new AppError(404, `News item ${id} not found`);
  await prisma.newsItem.delete({ where: { id } });
}
