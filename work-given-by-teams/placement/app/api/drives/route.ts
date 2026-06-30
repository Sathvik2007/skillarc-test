// app/api/drives/route.ts — MOCK version (no Supabase)
import { NextResponse } from "next/server";
import { MOCK_DRIVES } from "@/lib/mock-data";
import type { Drive } from "@/types";

const drives = [...MOCK_DRIVES];

export async function GET() {
  return NextResponse.json({ data: [...drives].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )});
}

export async function POST(req: Request) {
  const body = await req.json();
  const newDrive: Drive = {
    id: `d${Date.now()}`,
    created_at: new Date().toISOString(),
    applied: 0,
    shortlisted: 0,
    selected: 0,
    ...body,
  };
  drives.push(newDrive);
  return NextResponse.json({ data: newDrive }, { status: 201 });
}
