import crypto from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getSecret() {
  return process.env.ADMIN_COOKIE_SECRET ?? "dev-secret-change-me";
}

export function getCookieName() {
  return COOKIE_NAME;
}

export function createSessionToken() {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const nonce = crypto.randomUUID();
  const payload = `${expiresAt}:${nonce}`;
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return false;
  }
  const [expiresRaw] = payload.split(":");
  const expiresAt = Number(expiresRaw);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
