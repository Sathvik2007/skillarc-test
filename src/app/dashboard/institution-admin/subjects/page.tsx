import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ROLES } from "@/constants/roles"
import { SubjectsClientPage } from "./subjects-client"

export default async function SubjectsPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("users")
    .select("role, institution_id")
    .eq("id", user.id)
    .single()

  if (profile?.role !== ROLES.INSTITUTION_ADMIN) {
    redirect("/dashboard")
  }

  const institutionId = profile.institution_id

  const { data: subjects = [] } = await supabase
    .from("subjects")
    .select(`
      *,
      program:program_id(
        id, name,
        department:department_id(id, name)
      )
    `)
    .eq("institution_id", institutionId)
    .order("semester")
    .order("name")

  const { data: departments = [] } = await supabase
    .from("departments")
    .select("id, name")
    .eq("institution_id", institutionId)
    .order("name")

  const { data: programs = [] } = await supabase
    .from("programs")
    .select("id, name, department_id, department:department_id(id, name)")
    .eq("institution_id", institutionId)
    .order("name")

  return (
    <SubjectsClientPage
      initialSubjects={subjects}
      departments={departments}
      programs={programs}
      institutionId={institutionId}
    />
  )
}