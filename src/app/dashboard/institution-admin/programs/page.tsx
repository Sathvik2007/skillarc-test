import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ROLES } from "@/constants/roles"
import { ProgramsClientPage } from "./programs-client"

export default async function ProgramsPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.role !== ROLES.INSTITUTION_ADMIN) {
    redirect("/dashboard")
  }

  const institutionId = profile.institution_id

  const { data: programsData } = await supabase
    .from("programs")
    .select(`
      *,
      department:department_id(
        id,
        name
      )
    `)
    .eq("institution_id", institutionId)
    .order("name")

  const programs = programsData ?? []

  const { data: departmentsData } = await supabase
    .from("departments")
    .select("id,name")
    .eq("institution_id", institutionId)
    .order("name")

  const departments = departmentsData ?? []

  return (
    <ProgramsClientPage
      initialPrograms={programs}
      departments={departments}
      institutionId={institutionId}
      organizationId={profile.organization_id}
    />
  )
}