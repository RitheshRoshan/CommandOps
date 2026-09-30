import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "commandops-fallback-secret-at-least-32-chars-long"
);

export interface AdminTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminTokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getAuthenticatedAdmin(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("commandops_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}
