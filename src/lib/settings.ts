import { query } from "@/lib/db";

export type AdSettings = {
  adsenseEnabled: boolean;
  adsterraEnabled: boolean;
  adsterraPopunderEnabled: boolean;
  adsterraSocialbarEnabled: boolean;
};

const DEFAULTS: AdSettings = {
  adsenseEnabled: true,
  adsterraEnabled: true,
  adsterraPopunderEnabled: true,
  adsterraSocialbarEnabled: true,
};

const KEYS: (keyof AdSettings)[] = [
  "adsenseEnabled",
  "adsterraEnabled",
  "adsterraPopunderEnabled",
  "adsterraSocialbarEnabled",
];

export async function getAdSettings(): Promise<AdSettings> {
  const result = await query<{ key: string; value: string }>(
    "SELECT key, value FROM site_settings WHERE key = ANY($1)",
    [KEYS]
  );
  const settings = { ...DEFAULTS };
  result.rows.forEach((row) => {
    const key = row.key as keyof AdSettings;
    if (!KEYS.includes(key)) return;
    settings[key] = row.value === "true";
  });
  return settings;
}

export async function setAdSettings(next: AdSettings): Promise<void> {
  const entries = Object.entries(next) as [keyof AdSettings, boolean][];
  for (const [key, value] of entries) {
    await query(
      `INSERT INTO site_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, value ? "true" : "false"]
    );
  }
}
