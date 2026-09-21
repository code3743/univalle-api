import bcrypt from "bcryptjs";
import { env } from "../src/config/env.js";
import { prisma } from "../src/config/prisma.js";

async function main() {
  await prisma.appConfig.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });

  await prisma.welcomeBanner.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });

  await prisma.platformVersion.upsert({
    where: { platform: "IOS" },
    create: {
      platform: "IOS",
      enabled: false,
      latestVersion: "0.1.0",
      minRequiredVersion: "0.1.0",
      storeUrl: "https://apps.apple.com",
    },
    update: { enabled: false },
  });

  await prisma.platformVersion.upsert({
    where: { platform: "ANDROID" },
    create: {
      platform: "ANDROID",
      enabled: true,
      latestVersion: "0.1.0",
      minRequiredVersion: "0.1.0",
      storeUrl: "https://play.google.com",
    },
    update: { enabled: true },
  });

  const modules = [
    {
      key: "grades",
      label: "Historial de notas",
      icon: "notebook-text",
      route: "/grades",
      color: "#FF0000",
      quickAccessOrder: 0,
      sortOrder: 0,
    },
    {
      key: "digital_card",
      label: "Carné estudiantil",
      icon: "id-card",
      route: "/digital-card",
      color: "#7C3AED",
      quickAccessOrder: 1,
      sortOrder: 1,
    },
    {
      key: "tabulate",
      label: "Tabulado",
      icon: "layers",
      route: "/tabulated",
      color: "#16A34A",
      quickAccessOrder: 2,
      sortOrder: 2,
    },
    {
      key: "resolution",
      label: "Resolución",
      icon: "route",
      route: "/resolution",
      color: "#D97706",
      quickAccessOrder: 3,
      sortOrder: 3,
    },
    {
      key: "teacher_rating",
      label: "Calificar docente",
      icon: "star",
      route: "/teacher-rating",
      color: "#2563EB",
      quickAccessOrder: 4,
      sortOrder: 4,
    },
    {
      key: "schedule",
      label: "Horario de clases",
      icon: "calendar",
      route: "/schedule",
      color: "#7C3AED",
      quickAccessOrder: 5,
      sortOrder: 5,
    },
    {
      key: "library",
      label: "Biblioteca",
      icon: "library",
      route: "/library",
      color: "#DB2777",
      quickAccessOrder: null,
      sortOrder: 6,
    },
    {
      key: "restaurant",
      label: "Central (Meléndez)",
      icon: "utensils",
      route: "/restaurant",
      color: "#FF0000",
      quickAccessOrder: null,
      sortOrder: 7,
    },
    {
      key: "news",
      label: "Noticias",
      icon: "newspaper",
      route: "/news",
      color: "#2563EB",
      quickAccessOrder: null,
      sortOrder: 8,
    },
  ];

  for (const module of modules) {
    await prisma.appModule.upsert({
      where: { key: module.key },
      create: module,
      update: module,
    });
  }
  console.log(`Seeded ${modules.length} app modules`);

  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, env.BCRYPT_ROUNDS);
    await prisma.adminUser.upsert({
      where: { email: env.ADMIN_EMAIL },
      create: { email: env.ADMIN_EMAIL, passwordHash },
      update: { passwordHash },
    });
    console.log(`Seeded admin user: ${env.ADMIN_EMAIL}`);
  }

  console.log("Seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
