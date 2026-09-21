import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Univalle",
      version: "1.0.0",
      description: "Documentacion de la API",
    },
    servers: [
      { url: "https://api.jotalopez.dev/api", description: "Produccion" },
      { url: `http://localhost:${env.PORT}/api`, description: "Local" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(currentDir, "../routes/*.{ts,js}")],
};

export const swaggerSpec = swaggerJsdoc(options);
