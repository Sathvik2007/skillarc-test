// app/api/analytics/route.ts — MOCK version (no Supabase)
import { NextResponse } from "next/server";
import { buildAnalytics } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ data: buildAnalytics() });
}
