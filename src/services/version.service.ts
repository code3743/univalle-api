import type { Platform } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export interface UpsertVersionInput {
  latestVersion: string;
  minRequiredVersion: string;
  storeUrl: string;
  updateMessage?: string;
  enabled?: boolean;
}

export function listVersions() {
  return prisma.platformVersion.findMany();
}

export function upsertVersion(platform: Platform, data: UpsertVersionInput) {
  return prisma.platformVersion.upsert({
    where: { platform },
    create: { platform, ...data },
    update: data,
  });
}
