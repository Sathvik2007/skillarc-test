import { createSupabaseServerClient } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"
import { ROLES } from "@/constants/roles"
import { createSupabaseAdminClient } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("users")
      .select("role, institution_id")
      .eq("id", user.id)
      .single()

    if (profile?.role !== ROLES.INSTITUTION_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, institution_id, organization_id } = body

    if (!name || !email || !institution_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (institution_id !== profile.institution_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const adminClient = createSupabaseAdminClient()
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: password || Math.random().toString(36).slice(-12),
      email_confirm: true,
    })

    if (authError) throw authError

    const { data: parent, error } = await adminClient
      .from("users")
      .insert([
        {
          id: authData.user.id,
          name,
          email,
          role: ROLES.PARENT,
          institution_id,
          organization_id: organization_id || null,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(parent)
  } catch (error) {
    console.error("Parent creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    let query = supabase.from("users").select("*").eq("role", ROLES.PARENT)
    if (institutionId) query = query.eq("institution_id", institutionId)

    const { data, error } = await query.order("name")
    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Parent fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
