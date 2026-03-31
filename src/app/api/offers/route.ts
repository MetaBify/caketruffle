import { NextResponse } from "next/server";

const FEED_URL =
  process.env.OFFER_FEED_URL ??
  "https://d2dzcaq3bhqk1m.cloudfront.net/public/offers/feed.php";
const USER_ID = process.env.OFFER_USER_ID ?? "";
const API_KEY = process.env.OFFER_API_KEY ?? "";

export async function GET(request: Request) {
  if (!USER_ID || !API_KEY) {
    return NextResponse.json(
      { error: "Offer feed is not configured." },
      { status: 500 }
    );
  }

  const url = new URL(FEED_URL);
  const { searchParams } = new URL(request.url);
  const s1 = searchParams.get("s1") ?? "";
  const s2 = searchParams.get("s2") ?? "";

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const userAgent = request.headers.get("user-agent") ?? "";

  url.searchParams.set("user_id", USER_ID);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("limit", "10");
  url.searchParams.set("s1", s1);
  url.searchParams.set("s2", s2);
  if (ip && isPublicIp(ip)) url.searchParams.set("ip", ip);
  if (userAgent) url.searchParams.set("user_agent", userAgent);

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json(
      { error: "Offer feed request failed." },
      { status: 502 }
    );
  }

  const text = await response.text();
  return NextResponse.json(parseMaybeJson(text));
}

function isPublicIp(ip: string) {
  if (!ip) return false;
  if (ip === "127.0.0.1" || ip === "::1") return false;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return false;
  if (ip.startsWith("172.")) {
    const parts = ip.split(".");
    const second = Number(parts[1]);
    if (second >= 16 && second <= 31) return false;
  }
  return true;
}

function parseMaybeJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return JSON.parse(trimmed);
  }
  const match = trimmed.match(/^[^(]*\\(([\\s\\S]*)\\)\\s*;?$/);
  if (!match) {
    throw new Error("Unexpected offer response");
  }
  return JSON.parse(match[1]);
}
