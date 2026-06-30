// app/api/auth/route.ts — MOCK version (no Supabase)
import { NextResponse } from "next/server";
import { createToken } from "@/lib/auth";
import { MOCK_USERS } from "@/lib/mock-data";
import type { LoginPayload } from "@/types";

export async function POST(req: Request) {
  try {
    const body: LoginPayload = await req.json();
    const { username, password, login_type } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const user = MOCK_USERS.find(u => u.username === username);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const expectedRole: Record<string, string> = {
      "Official (Placement Cell)": "Official",
      "Official":                  "Official",
      "Student":                   "Student",
      "Company Admin":             "Admin",
    };

    if (user.role !== expectedRole[login_type]) {
      return NextResponse.json(
        { error: `Role mismatch: your account is "${user.role}" but you selected "${login_type}"` },
        { status: 403 }
      );
    }

    const token = await createToken({
      id:         user.id,
      username:   user.username,
      role:       user.role as any,
      company:    user.company    ?? undefined,
      student_id: user.student_id ?? undefined,
    });

    const res = NextResponse.json({ ok: true, role: user.role });
    res.cookies.set("apex_token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 8,
      path:     "/",
    });

    return res;
  } catch (err) {
    console.error("[/api/auth POST]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("apex_token");
  return res;
}
