import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vaccine-panda-dev-secret-change-in-production";

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