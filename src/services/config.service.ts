import type { Platform } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { checkVersion } from "../utils/version.js";
import { DEFAULT_WELCOME } from "./welcome.service.js";

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
  const [config, platformVersion, modules, welcome, announcements] = await prisma.$transaction([
    prisma.appConfig.findUnique({ where: { id: 1 } }),
    prisma.platformVersion.findUnique({ where: { platform } }),
    prisma.appModule.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.welcomeBanner.findUnique({ where: { id: 1 } }),
    prisma.announcement.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      take: 20,
    }),
  ]);

  const cfg = config ?? DEFAULT_CONFIG;
  const ver = platformVersion ?? DEFAULT_VERSION;
  const banner = welcome ?? DEFAULT_WELCOME;
  const { updateAvailable, updateRequired } = checkVersion(
    clientVersion,
    ver.latestVersion,
    ver.minRequiredVersion,
  );

  const enabledModules = modules.filter((module) =>
    platform === "IOS" ? module.enabledIos : module.enabledAndroid,
  );

  const modulesList = enabledModules.map((module) => ({
    key: module.key,
    label: module.label,
    icon: module.icon,
    route: module.route,
  }));

  const quickAccess = enabledModules
    .filter((module) => module.quickAccessOrder !== null)
    .sort((a, b) => a.quickAccessOrder! - b.quickAccessOrder!)
    .map((module) => module.key);

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
    modules: modulesList,
    quickAccess,
    welcome: {
      enabled: banner.enabled,
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
    },
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      imageUrl: a.imageUrl,
    })),
  };
}
