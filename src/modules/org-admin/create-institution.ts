"use server"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { ROLES } from "@/constants/roles"
import { clearInstitutionName } from "@/app/dashboard/faculty/components/faculty-cache-v2"
import { getRequestAppOrigin, inviteUser } from "@/lib/invite-user"

export async function createInstitution(data: {
  name: string
  domain?: string
  adminEmail: string
}) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not logged in" }

    const { data: profile } = await supabase
      .from("users")
      .select("organization_id")
      .eq("id", user.id)
      .single()
    if (!profile?.organization_id) return { success: false, error: "No organization found" }

    const { data: inst, error } = await supabase
      .from("institutions")
      .insert({
        name: data.name,
        domain: data.domain || null,
        organization_id: profile.organization_id,
      })
      .select()
      .single()
    if (error) {
      console.error("[org-admin] DB insert error", error)
      return { success: false, error: error.message || "Failed to create institution in database" }
    }

    const origin = await getRequestAppOrigin()

    try {
      await inviteUser({
        email: data.adminEmail,
        role: ROLES.INSTITUTION_ADMIN,
        institutionId: inst.id,
        organizationId: profile.organization_id,
        origin,
      })
    } catch (inviteError: any) {
      console.error("[org-admin] invite request failed", inviteError)
      return { success: false, error: inviteError.message || "Failed to invite admin" }
    }

    revalidatePath("/dashboard/org-admin")
    return { success: true }
  } catch (err: any) {
    console.error("[org-admin] unexpected error", err)
    return { success: false, error: err.message || "Unexpected error occurred" }
  }
}

export async function deleteInstitution(id: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
      .from("institutions")
      .delete()
      .eq("id", id)
    if (error) return { success: false, error: error.message }
    try {
      if (process.env.CACHE_DEBUG === "1") console.debug("[org-admin] clearing institution cache", id)
      clearInstitutionName(id)
    } catch (e) {
      console.warn('failed to clear institution cache', e)
    }
    revalidatePath("/dashboard/org-admin")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateInstitution(id: string, data: { name: string; domain?: string }) {
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
      .from("institutions")
      .update({ name: data.name, domain: data.domain || null })
      .eq("id", id)
    if (error) return { success: false, error: error.message }
    try {
      if (process.env.CACHE_DEBUG === "1") console.debug("[org-admin] clearing institution cache", id)
      clearInstitutionName(id)
    } catch (e) {
      console.warn('failed to clear institution cache', e)
    }
    revalidatePath("/dashboard/org-admin")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}