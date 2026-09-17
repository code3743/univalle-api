import { prisma } from "../config/prisma.js";

export const DEFAULT_WELCOME = {
  enabled: false,
  title: "",
  description: "",
  imageUrl: null,
  linkUrl: null,
};

export interface UpdateWelcomeInput {
  enabled?: boolean;
  title?: string;
  description?: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
}

export async function getRawWelcome() {
  const banner = await prisma.welcomeBanner.findUnique({ where: { id: 1 } });
  return banner ?? { id: 1, ...DEFAULT_WELCOME, updatedAt: null };
}

export function updateWelcome(patch: UpdateWelcomeInput) {
  return prisma.welcomeBanner.upsert({
    where: { id: 1 },
    create: { id: 1, ...DEFAULT_WELCOME, ...patch },
    update: patch,
  });
}
