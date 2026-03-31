import { NextResponse } from "next/server";

const CHECK_URL =
  process.env.OFFER_CHECK_URL ??
  "https://d2dzcaq3bhqk1m.cloudfront.net/public/external/check2.php";
const USER_ID = process.env.OFFER_USER_ID ?? "";
const API_KEY = process.env.OFFER_API_KEY ?? "";

export async function GET(request: Request) {
  const url = new URL(CHECK_URL);
  url.searchParams.set("testing", process.env.OFFER_TESTING ?? "0");
  if (USER_ID) url.searchParams.set("user_id", USER_ID);
  if (API_KEY) url.searchParams.set("api_key", API_KEY);

  const { searchParams } = new URL(request.url);
  const s1 = searchParams.get("s1");
  const s2 = searchParams.get("s2");
  if (s1) url.searchParams.set("s1", s1);
  if (s2) url.searchParams.set("s2", s2);

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json(
      { error: "Lead check failed." },
      { status: 502 }
    );
  }

  const text = await response.text();
  return NextResponse.json(parseMaybeJson(text));
}

function parseMaybeJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("//callback") || trimmed.includes("empty visitor")) {
    return [];
  }
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return JSON.parse(trimmed);
  }
  const match = trimmed.match(/^[^(]*\\((.*)\\)\\s*;?$/s);
  if (!match) {
    throw new Error("Unexpected lead response");
  }
  return JSON.parse(match[1]);
}
