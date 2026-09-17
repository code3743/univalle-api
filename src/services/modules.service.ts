import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export interface CreateModuleInput {
  key: string;
  label: string;
  icon: string;
  route: string;
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
