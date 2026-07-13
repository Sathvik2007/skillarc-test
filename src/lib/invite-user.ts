import { headers } from "next/headers"
import { createSupabaseAdminClient } from "./supabase-admin"

export function resolveAppOrigin(headersValue?: Headers | { get(name: string): string | null } | null): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, "")
  }

  if (headersValue) {
    const forwardedProto = headersValue.get("x-forwarded-proto")
    const forwardedHost = headersValue.get("x-forwarded-host")
    const host = forwardedHost?.split(",")[0]?.trim() || headersValue.get("host")
    const proto = forwardedProto?.split(",")[0]?.trim() || "https"

    if (host) {
      return `${proto}://${host}`.replace(/\/+$/, "")
    }
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`
  }

  if (process.env.NEXTAUTH_URL?.trim()) {
    return process.env.NEXTAUTH_URL.replace(/\/+$/, "")
  }

  return "http://localhost:3000"
}

export async function getRequestAppOrigin() {
  const headerStore = await headers()
  return resolveAppOrigin(headerStore)
}

export async function readResponseError(response: Response, fallback = "Request failed") {
  try {
    const contentType = response.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const data = await response.json()

      if (typeof data === "string") return data
      if (data && typeof data === "object" && "error" in data) {
        const errorValue = (data as { error?: unknown }).error
        if (typeof errorValue === "string") return errorValue
      }
    }

    const text = await response.text()
    if (text?.trim()) return text
  } catch (error) {
    console.warn("[invite-user] failed to parse error response", error)
  }

  return fallback
}

export async function inviteUser(params: {
  email: string
  role: string
  institutionId: string
  organizationId: string
  origin?: string
}) {
  const { email, role, institutionId, organizationId, origin: passedOrigin } = params
  const supabase = createSupabaseAdminClient()
  
  let origin = passedOrigin
  if (!origin) {
    try {
      origin = await getRequestAppOrigin()
    } catch {
      origin = resolveAppOrigin()
    }
  }
  const redirectToUrl = new URL("/auth/callback", origin)
  redirectToUrl.searchParams.set("inviteEmail", email)
  const redirectTo = redirectToUrl.toString()

  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error("🔴 Error listing users:", listError)
    throw new Error("Failed to check existing users: " + listError.message)
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
      throw new Error(upsertError.message)
    }

    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, { redirectTo })
    if (inviteError) {
      console.error("🔴 Invite error:", inviteError)
      throw new Error(inviteError.message)
    }

    return { success: true, message: "Existing user invited" }
  }

  console.log(`📧 Creating new invite for ${email} with role: ${role}`)
  const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, { redirectTo })
  if (inviteError) {
    console.error("🔴 Invite error:", inviteError)
    throw new Error(inviteError.message)
  }

  if (!data?.user?.id) {
    throw new Error("Failed to create user")
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
    throw new Error(insertError.message)
  }

  return { success: true, message: "Invitation sent successfully" }
}
