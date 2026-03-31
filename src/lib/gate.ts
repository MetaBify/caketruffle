import crypto from "crypto";

const COOKIE_PREFIX = "gate_";

function getSecret() {
  return (
    process.env.GATE_COOKIE_SECRET ||
    process.env.ADMIN_COOKIE_SECRET ||
    "dev-gate-secret"
  );
}

export function getGateCookieName(code: string) {
  return `${COOKIE_PREFIX}${code}`;
}

export function createGateToken(code: string, issuedAt: number) {
  const payload = `${code}:${issuedAt}`;
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyGateToken(token: string | undefined, code: string) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  const [payloadCode, issuedAtRaw] = payload.split(":");
  if (payloadCode !== code) return null;
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return null;
  return issuedAt;
}
