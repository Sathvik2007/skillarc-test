import { createSupabaseServerClient } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"
import { ROLES } from "@/constants/roles"
import { inviteUser } from "@/lib/invite-user"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Step 4: select organization_id so the invite API receives it
    const { data: profile } = await supabase
      .from("users")
      .select("role, institution_id, organization_id")
      .eq("id", user.id)
      .single()

    if (profile?.role !== ROLES.INSTITUTION_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, department_id, institution_id } = body

    if (!name || !email || !institution_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (institution_id !== profile.institution_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Steps 1 & 2: createUser() block removed.
    // Step 3: delegate auth + user creation to the shared invite API
    await inviteUser({
      email,
      role: ROLES.FACULTY,
      institutionId: institution_id,
      organizationId: profile.organization_id,
    })

    // Patch in the extra faculty fields (name, department) that invite-user doesn't set
    const { data: faculty, error } = await supabase
      .from("users")
      .update({
        name,
        department_id: department_id || null,
      })
      .eq("email", email)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(faculty)
  } catch (error: any) {
    console.error("Faculty creation error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const institutionId = request.nextUrl.searchParams.get("institution_id")

    const query = supabase
      .from("users")
      .select("*")
      .eq("role", ROLES.FACULTY)

    if (institutionId) query.eq("institution_id", institutionId)

    const { data, error } = await query.order("name")

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Faculty fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}