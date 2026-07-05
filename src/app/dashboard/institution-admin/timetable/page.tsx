import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ROLES } from "@/constants/roles"
import { TimetableClientPage } from "./timetable-client"

export default async function TimetablePage() {
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

  const [departmentsRes, programsRes, sectionsRes] = await Promise.all([
    supabase
      .from("departments")
      .select("id, name")
      .eq("institution_id", institutionId)
      .order("name"),
    supabase
      .from("programs")
      .select("id, name, department_id")
      .eq("institution_id", institutionId)
      .order("name"),
    supabase
      .from("sections")
      .select("id, name, semester, program_id")
      .eq("institution_id", institutionId)
      .order("semester")
      .order("name"),
  ])

  const departmentsData = departmentsRes.data
  const programsData = programsRes.data
  const sectionsData = sectionsRes.data

  return (
    <TimetableClientPage
      departments={departmentsData ?? []}
      programs={programsData ?? []}
      sections={sectionsData ?? []}
    />
  )
}