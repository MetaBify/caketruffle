import { Pool, type QueryResult, type QueryResultRow } from "pg";

declare global {
  var __neonPool: Pool | undefined;
  var __neonInit: Promise<void> | undefined;
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set.");
}

const pool =
  globalThis.__neonPool ||
  new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

if (!globalThis.__neonPool) {
  globalThis.__neonPool = pool;
}

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS short_links (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      target_url TEXT NOT NULL,
      image_url TEXT,
      description TEXT,
      require_offer_wall BOOLEAN NOT NULL DEFAULT TRUE,
      wait_seconds INTEGER NOT NULL DEFAULT 600,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      click_count INTEGER NOT NULL DEFAULT 0,
      s1 TEXT,
      s2 TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_short_links_code ON short_links(code);

    ALTER TABLE short_links
      ADD COLUMN IF NOT EXISTS image_url TEXT;

    CREATE TABLE IF NOT EXISTS admin_login_attempts (
      ip TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      locked_until TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS admin_login_events (
      id TEXT PRIMARY KEY,
      ip TEXT,
      success BOOLEAN NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash
      ON admin_sessions(token_hash);

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

const initPromise = globalThis.__neonInit || initSchema();
if (!globalThis.__neonInit) {
  globalThis.__neonInit = initPromise;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null | string[])[]
) : Promise<QueryResult<T>> {
  await initPromise;
  return pool.query<T>(text, params);
}
