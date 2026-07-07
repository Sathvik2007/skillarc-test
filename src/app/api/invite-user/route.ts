import { createSupabaseAdminClient } from "@/lib/supabase-admin"
import { resolveAppOrigin } from "@/lib/invite-user"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { email, role, institutionId, organizationId } = await req.json()

  if (!email || !role || !institutionId || !organizationId) {
    return NextResponse.json(
      { error: "Missing required fields: email, role, institutionId, organizationId" },
      { status: 400 }
    )
  }

  const supabase = createSupabaseAdminClient()
  const origin = resolveAppOrigin()
  const redirectTo = `${origin}/auth/callback`

  try {
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      console.error("🔴 Error listing users:", listError)
      return NextResponse.json({ error: "Failed to check existing users" }, { status: 500 })
    }

    const existing = existingUsers?.users?.find(u => u.email === email)

    if (existing) {
      console.log(`📧 User exists (${email}), upserting to users table with role: ${role}`)
      const { error: upsertError } = await supabase.from("users").upsert({
        id: existing.id,
        email,
        role,
        institution_id: institutionId,
        organization_id: organizationId,
        name: email.split("@")[0], // Use email prefix as default name
      }, { onConflict: "id" })
      
      if (upsertError) {
        console.error("🔴 Upsert error:", upsertError)
        return NextResponse.json({ error: upsertError.message }, { status: 400 })
      }

      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, { redirectTo })
      if (inviteError) {
        console.error("🔴 Invite error:", inviteError)
        return NextResponse.json({ error: inviteError.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: "Existing user invited" })
    }

    console.log(`📧 Creating new invite for ${email} with role: ${role}`)
    const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, { redirectTo })
    if (inviteError) {
      console.error("🔴 Invite error:", inviteError)
      return NextResponse.json({ error: inviteError.message }, { status: 400 })
    }

    if (!data?.user?.id) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 400 })
    }

    console.log(`✅ User invited, inserting to users table with id: ${data.user.id}, role: ${role}`)
    const { error: insertError } = await supabase.from("users").insert({
      id: data.user.id,
      email,
      role,
      institution_id: institutionId,
      organization_id: organizationId,
      name: email.split("@")[0], // Use email prefix as default name
    })

    if (insertError) {
      console.error("🔴 Insert error:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Invitation sent successfully" })
  } catch (error) {
    console.error("🔴 Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}