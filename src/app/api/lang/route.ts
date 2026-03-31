import { NextResponse } from "next/server";
import { normalizeLang } from "@/lib/i18n";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = normalizeLang(searchParams.get("set") ?? "en");
  const nextPath = searchParams.get("next") ?? "/";

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
