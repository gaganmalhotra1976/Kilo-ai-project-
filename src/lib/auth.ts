import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vaccine-panda-dev-secret-change-in-production";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export function verifyToken(token: string): { customerId: number; phone: string; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { customerId: number; phone: string; name: string };
  } catch {
    return null;
  }
}

export function generateToken(payload: { customerId: number; phone: string; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
