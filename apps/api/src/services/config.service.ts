import type { Platform } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { checkVersion } from "../utils/version.js";

const DEFAULT_CONFIG = {
  maintenanceEnabled: false,
  maintenanceTitle: "",
  maintenanceMessage: "",
};

const DEFAULT_VERSION = {
  enabled: false,
  latestVersion: "0.0.0",
  minRequiredVersion: "0.0.0",
  storeUrl: "",
  updateMessage: "",
};

export interface UpdateConfigInput {
  maintenanceEnabled?: boolean;
  maintenanceTitle?: string;
  maintenanceMessage?: string;
}

export async function getRawConfig() {
  const config = await prisma.appConfig.findUnique({ where: { id: 1 } });
  return config ?? { id: 1, ...DEFAULT_CONFIG, updatedAt: null };
}

export function updateConfig(patch: UpdateConfigInput) {
  return prisma.appConfig.upsert({
    where: { id: 1 },
    create: { id: 1, ...DEFAULT_CONFIG, ...patch },
    update: patch,
  });
}

export async function getAppConfig(platform: Platform, clientVersion?: string) {
  const [config, platformVersion] = await prisma.$transaction([
    prisma.appConfig.findUnique({ where: { id: 1 } }),
    prisma.platformVersion.findUnique({ where: { platform } }),
  ]);

  const cfg = config ?? DEFAULT_CONFIG;
  const ver = platformVersion ?? DEFAULT_VERSION;
  const { updateAvailable, updateRequired } = checkVersion(
    clientVersion,
    ver.latestVersion,
    ver.minRequiredVersion,
  );

  return {
    platformEnabled: ver.enabled,
    maintenance: {
      enabled: cfg.maintenanceEnabled,
      title: cfg.maintenanceTitle,
      message: cfg.maintenanceMessage,
    },
    update: {
      latestVersion: ver.latestVersion,
      updateAvailable,
      updateRequired,
      storeUrl: ver.storeUrl,
      message: ver.updateMessage,
    },
  };
}
