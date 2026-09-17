import type { AdminTokenPayload } from "../utils/jwt.js";

declare module "express-serve-static-core" {
  interface Request {
    admin?: AdminTokenPayload;
  }
}
