// app/api/students/route.ts — MOCK version (no Supabase)
import { NextResponse } from "next/server";
import { MOCK_STUDENTS } from "@/lib/mock-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get("q") ?? "").toLowerCase();
  const branch = searchParams.get("branch") ?? "";
  const status = searchParams.get("status") ?? "";
  const limit  = parseInt(searchParams.get("limit") ?? "200");

  let data = MOCK_STUDENTS;

  if (search) {
    data = data.filter(s =>
      s.student_id.toLowerCase().includes(search) ||
      s.name.toLowerCase().includes(search)
    );
  }
  if (branch) data = data.filter(s => s.branch === branch);
  if (status) data = data.filter(s => s.status === status);

  data = data.slice(0, limit).sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ data });
}
