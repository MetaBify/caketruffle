import { NextResponse } from "next/server";
import { getShortLinkByCode } from "@/lib/shortlinks";
import { createGateToken, getGateCookieName } from "@/lib/gate";

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

  const issuedAt = Date.now();
  const token = createGateToken(code, issuedAt);

  const response = NextResponse.json({ waitSeconds: link.wait_seconds });
  response.cookies.set(getGateCookieName(code), token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}
