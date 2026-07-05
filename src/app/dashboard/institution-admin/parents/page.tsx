import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ParentsClientPage } from "./parents-client"
import { ROLES } from "@/constants/roles"

export default async function ParentsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: userProfile } = await supabase
    .from("users")
    .select("role, institution_id")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (userProfile?.role !== ROLES.INSTITUTION_ADMIN) redirect("/dashboard")

  const institutionId = userProfile.institution_id

  const { data: parents = [] } = await supabase
    .from("users")
    .select("*")
    .eq("institution_id", institutionId)
    .eq("role", ROLES.PARENT)
    .order("name")

  return (
    <ParentsClientPage initialParents={parents || []} institutionId={institutionId} />
  )
}
