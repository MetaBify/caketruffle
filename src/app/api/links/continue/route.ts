import { NextResponse } from "next/server";
import { getShortLinkByCode, incrementClick } from "@/lib/shortlinks";
import { getGateCookieName, verifyGateToken } from "@/lib/gate";

const CHECK_URL =
  process.env.OFFER_CHECK_URL ??
  "https://d2dzcaq3bhqk1m.cloudfront.net/public/external/check2.php";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? "";
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const link = await getShortLinkByCode(code);
  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!link.require_offer_wall) {
    await incrementClick(code);
    return NextResponse.json({ url: link.target_url });
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(getGateCookieName(code))?.value;
  const issuedAt = verifyGateToken(token, code);
  if (!issuedAt) {
    return NextResponse.json(
      { error: "Gate not initialized" },
      { status: 403 }
    );
  }

  const elapsedSeconds = Math.floor((Date.now() - issuedAt) / 1000);
  const remaining = Math.max(link.wait_seconds - elapsedSeconds, 0);

  const leadComplete = await checkLeads();
  if (remaining > 0 && !leadComplete) {
    return NextResponse.json(
      { allowed: false, remaining },
      { status: 403 }
    );
  }

  await incrementClick(code);
  return NextResponse.json({ url: link.target_url });
}

async function checkLeads() {
  try {
    const url = new URL(CHECK_URL);
    url.searchParams.set("testing", process.env.OFFER_TESTING ?? "0");
    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) return false;
    const text = await response.text();
    const data = parseMaybeJson(text);
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
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
