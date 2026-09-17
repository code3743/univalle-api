import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { signAdminToken } from "../utils/jwt.js";

export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin?.isActive) {
    throw new AppError(401, "Invalid credentials");
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid credentials");
  }

  const token = signAdminToken({ sub: admin.id, email: admin.email });
  return { token, admin: { id: admin.id, email: admin.email } };
}

export async function getAdminById(id: string) {
  const admin = await prisma.adminUser.findUnique({ where: { id } });
  if (!admin) throw new AppError(404, "Admin not found");
  return { id: admin.id, email: admin.email };
}
