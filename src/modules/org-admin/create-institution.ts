"use server"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { ROLES } from "@/constants/roles"
import { clearInstitutionName } from "@/app/dashboard/faculty/components/faculty-cache-v2"
import { getRequestAppOrigin, readResponseError } from "@/lib/invite-user"

export async function createInstitution(data: {
  name: string
  domain?: string
  adminEmail: string
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not logged in")

  const { data: profile } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single()
  if (!profile?.organization_id) throw new Error("No organization found")

  const { data: inst, error } = await supabase
    .from("institutions")
    .insert({
      name: data.name,
      domain: data.domain || null,
      organization_id: profile.organization_id,
    })
    .select()
    .single()
  if (error) throw error

  const origin = await getRequestAppOrigin()
  let res: Response

  try {
    res = await fetch(`${origin}/api/invite-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.adminEmail,
        role: ROLES.INSTITUTION_ADMIN,
        institutionId: inst.id,
        organizationId: profile.organization_id,
      }),
    })
  } catch (error) {
    console.error("[org-admin] invite request failed", error)
    throw new Error("Unable to reach invite service")
  }

  if (!res.ok) {
    const message = await readResponseError(res, "Failed to invite admin")
    throw new Error(message)
  }

  revalidatePath("/dashboard/org-admin")
}

export async function deleteInstitution(id: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("institutions")
    .delete()
    .eq("id", id)
  if (error) throw error
  try {
    if (process.env.CACHE_DEBUG === "1") console.debug("[org-admin] clearing institution cache", id)
    clearInstitutionName(id)
  } catch (e) {
    console.warn('failed to clear institution cache', e)
  }
  revalidatePath("/dashboard/org-admin")
}

export async function updateInstitution(id: string, data: { name: string; domain?: string }) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("institutions")
    .update({ name: data.name, domain: data.domain || null })
    .eq("id", id)
  if (error) throw error
  try {
    if (process.env.CACHE_DEBUG === "1") console.debug("[org-admin] clearing institution cache", id)
    clearInstitutionName(id)
  } catch (e) {
    console.warn('failed to clear institution cache', e)
  }
  revalidatePath("/dashboard/org-admin")
}