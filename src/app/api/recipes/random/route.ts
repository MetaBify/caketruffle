import { NextResponse } from "next/server";
import { getRandomMeals } from "@/lib/recipes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = Math.max(1, Math.min(18, Number(searchParams.get("count") ?? 9)));
  const meals = await getRandomMeals(count);
  return NextResponse.json(meals);
}
