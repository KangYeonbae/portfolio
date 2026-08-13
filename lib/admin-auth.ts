import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "kyb_studio_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function configuredToken() {
  return process.env.ADMIN_API_TOKEN?.trim() ?? "";
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function signature(expiresAt: string) {
  return createHmac("sha256", configuredToken()).update(`studio:${expiresAt}`).digest("base64url");
}

export function verifyAdminToken(candidate: string | null | undefined) {
  const expected = configuredToken();
  if (!expected || !candidate) return false;
  return safeEqual(candidate.trim(), expected);
}

export function createAdminSession() {
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS);
  return { value: `${expiresAt}.${signature(expiresAt)}`, maxAge: SESSION_TTL_SECONDS };
}

export function verifyAdminSession(value: string | null | undefined) {
  if (!configuredToken() || !value) return false;
  const [expiresAt, suppliedSignature] = value.split(".");
  if (!expiresAt || !suppliedSignature || Number(expiresAt) <= Date.now() / 1000) return false;
  return safeEqual(suppliedSignature, signature(expiresAt));
}

export function isAdminRequest(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (verifyAdminToken(bearer)) return true;
  return verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
}
