import { query } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

export type ShortLink = {
  id: string;
  code: string;
  title: string;
  target_url: string;
  image_url?: string | null;
  description?: string | null;
  require_offer_wall: number;
  wait_seconds: number;
  created_at: string;
  updated_at: string;
  click_count: number;
  s1?: string | null;
  s2?: string | null;
};

const RESERVED_CODES = new Set([
  "admin",
  "recipes",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

const createSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, - and _ are allowed."),
  title: z.string().min(2).max(120),
  targetUrl: z
    .string()
    .url()
    .refine((value) => value.startsWith("http"), {
      message: "Target URL must start with http or https.",
    }),
  imageUrl: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .refine(
      (value) =>
        !value || value.startsWith("http") || value.startsWith("/uploads/"),
      {
        message: "Image URL must be http(s) or a local /uploads path.",
      }
    ),
  description: z.string().max(240).optional(),
  waitSeconds: z.coerce.number().int().min(0).max(3600),
  requireOfferWall: z.coerce.boolean(),
  s1: z.string().max(80).optional(),
  s2: z.string().max(80).optional(),
});

export async function listShortLinks(): Promise<ShortLink[]> {
  const result = await query<ShortLink>(
    `SELECT id, code, title, target_url, image_url, description, require_offer_wall,
            wait_seconds, created_at, updated_at, click_count, s1, s2
     FROM short_links
     ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function getShortLinkByCode(code: string): Promise<ShortLink | null> {
  const result = await query<ShortLink>(
    `SELECT id, code, title, target_url, image_url, description, require_offer_wall,
            wait_seconds, created_at, updated_at, click_count, s1, s2
     FROM short_links
     WHERE code = $1`,
    [code]
  );
  return result.rows[0] ?? null;
}

export async function createShortLink(input: {
  code: string;
  title: string;
  targetUrl: string;
  imageUrl?: string;
  description?: string;
  waitSeconds: number;
  requireOfferWall: boolean;
  s1?: string;
  s2?: string;
}) {
  const parsed = createSchema.parse(input);
  if (RESERVED_CODES.has(parsed.code.toLowerCase())) {
    throw new Error("That code is reserved. Pick another.");
  }
  const id = crypto.randomUUID();
  await query(
    `INSERT INTO short_links
      (id, code, title, target_url, image_url, description, require_offer_wall, wait_seconds, s1, s2)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      id,
      parsed.code,
      parsed.title,
      parsed.targetUrl,
      parsed.imageUrl ?? null,
      parsed.description ?? null,
      parsed.requireOfferWall,
      parsed.waitSeconds,
      parsed.s1 ?? null,
      parsed.s2 ?? null,
    ]
  );
  return id;
}

export async function deleteShortLink(id: string) {
  await query(`DELETE FROM short_links WHERE id = $1`, [id]);
}

export async function incrementClick(code: string) {
  await query(
    `UPDATE short_links
     SET click_count = click_count + 1,
         updated_at = NOW()
     WHERE code = $1`,
    [code]
  );
}
