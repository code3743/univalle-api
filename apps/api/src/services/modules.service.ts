import type { Platform } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export interface CreateModuleInput {
  key: string;
  label: string;
  icon: string;
  route: string;
  color: string;
  description?: string;
  enabledIos?: boolean;
  enabledAndroid?: boolean;
  quickAccessOrder?: number | null;
  sortOrder?: number;
}

export type UpdateModuleInput = Partial<Omit<CreateModuleInput, "key">>;

export function listModules() {
  return prisma.appModule.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function listPublicModules(platform: Platform) {
  const modules = await prisma.appModule.findMany({ orderBy: { sortOrder: "asc" } });

  const enabledModules = modules.filter((module) =>
    platform === "IOS" ? module.enabledIos : module.enabledAndroid,
  );

  const items = enabledModules.map((module) => ({
    key: module.key,
    label: module.label,
    icon: module.icon,
    route: module.route,
    color: module.color,
  }));

  const quickAccess = enabledModules
    .filter((module) => module.quickAccessOrder !== null)
    .sort((a, b) => a.quickAccessOrder! - b.quickAccessOrder!)
    .map((module) => module.key);

  return { items, quickAccess };
}

export function createModule(data: CreateModuleInput) {
  return prisma.appModule.create({ data });
}

export async function updateModule(key: string, patch: UpdateModuleInput) {
  const exists = await prisma.appModule.findUnique({ where: { key } });
  if (!exists) throw new AppError(404, `Module ${key} not found`);
  return prisma.appModule.update({ where: { key }, data: patch });
}

export async function deleteModule(key: string) {
  const exists = await prisma.appModule.findUnique({ where: { key } });
  if (!exists) throw new AppError(404, `Module ${key} not found`);
  await prisma.appModule.delete({ where: { key } });
}
