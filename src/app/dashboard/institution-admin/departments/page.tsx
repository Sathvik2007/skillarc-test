import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ROLES } from "@/constants/roles"
import { DepartmentsClientPage } from "./departments-client"

export default async function DepartmentsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: profile } = await supabase
    .from("users")
    .select("role, institution_id")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (profile?.role !== ROLES.INSTITUTION_ADMIN) {
    redirect("/dashboard")
  }

  const { data: departments = [] } = await supabase
    .from("departments")
    .select("*")
    .eq("institution_id", profile.institution_id)
    .order("name")

  return (
    <DepartmentsClientPage
      initialDepartments={departments ?? []}
      institutionId={profile.institution_id}
    />
  )
}