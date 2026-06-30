// app/api/companies/route.ts — MOCK version (no Supabase)
import { NextResponse } from "next/server";
import { MOCK_COMPANIES } from "@/lib/mock-data";
import type { Company } from "@/types";

const companies = [...MOCK_COMPANIES];

export async function GET() {
  return NextResponse.json({ data: [...companies].sort((a, b) => a.name.localeCompare(b.name)) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const newCompany: Company = {
    id: `c${Date.now()}`,
    ...body,
  };
  companies.push(newCompany);
  return NextResponse.json({ data: newCompany }, { status: 201 });
}
