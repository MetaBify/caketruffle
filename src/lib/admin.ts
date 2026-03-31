import crypto from "crypto";
import { headers } from "next/headers";
import { query } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const LOCK_MINUTES = 15;

export async function getClientMeta() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for") ?? "";
  const ip =
    forwarded.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  const userAgent = headerList.get("user-agent") ?? "";
  return { ip, userAgent };
}

export async function isIpLocked(ip: string) {
  const result = await query<{ locked_until: string | null }>(
    `SELECT locked_until FROM admin_login_attempts WHERE ip = $1`,
    [ip]
  );
  const lockedUntil = result.rows[0]?.locked_until;
  if (!lockedUntil) return false;
  return new Date(lockedUntil).getTime() > Date.now();
}

export async function recordLoginEvent(ip: string, success: boolean) {
  const id = crypto.randomUUID();
  await query(
    `INSERT INTO admin_login_events (id, ip, success)
     VALUES ($1, $2, $3)`,
    [id, ip, success]
  );
}

export async function recordFailedAttempt(ip: string) {
  const result = await query<{
    attempts: number;
    last_attempt: string;
  }>(
    `SELECT attempts, last_attempt
     FROM admin_login_attempts
     WHERE ip = $1`,
    [ip]
  );

  const now = new Date();
  const row = result.rows[0];
  const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);

  let attempts = 1;
  if (row && new Date(row.last_attempt) >= windowStart) {
    attempts = row.attempts + 1;
  }

  const lockedUntil =
    attempts >= MAX_ATTEMPTS
      ? new Date(now.getTime() + LOCK_MINUTES * 60 * 1000)
      : null;

  await query(
    `INSERT INTO admin_login_attempts (ip, attempts, last_attempt, locked_until)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (ip)
     DO UPDATE SET
       attempts = EXCLUDED.attempts,
       last_attempt = EXCLUDED.last_attempt,
       locked_until = EXCLUDED.locked_until`,
    [ip, attempts, now.toISOString(), lockedUntil?.toISOString() ?? null]
  );
}

export async function recordSuccessfulLogin(ip: string) {
  await query(
    `INSERT INTO admin_login_attempts (ip, attempts, last_attempt, locked_until)
     VALUES ($1, 0, $2, NULL)
     ON CONFLICT (ip)
     DO UPDATE SET
       attempts = 0,
       last_attempt = EXCLUDED.last_attempt,
       locked_until = NULL`,
    [ip, new Date().toISOString()]
  );
}

export async function storeSession(
  token: string,
  ip: string,
  userAgent: string
) {
  const id = crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await query(
    `INSERT INTO admin_sessions (id, token_hash, ip, user_agent)
     VALUES ($1, $2, $3, $4)`,
    [id, tokenHash, ip, userAgent]
  );
}
