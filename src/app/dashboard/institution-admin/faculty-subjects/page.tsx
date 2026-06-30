import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ROLES } from "@/constants/roles"
import { FacultySubjectsClientPage } from "./faculty-subjects-client"

export default async function FacultySubjectsPage() {
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

  const { data: facultyData } = await supabase
    .from("users")
    .select("id,name")
    .eq("institution_id", institutionId)
    .eq("role", ROLES.FACULTY)
    .order("name")

  const faculty = facultyData ?? []

  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("id,name,code,semester")
    .eq("institution_id", institutionId)
    .order("name")

  const subjects = subjectsData ?? []

  const { data: assignmentsData } = await supabase
    .from("faculty_subjects")
    .select(`
      id,
      faculty_id,
      subject_id
    `)
    .eq("institution_id", institutionId)

  const assignments = assignmentsData ?? []

  return (
    <FacultySubjectsClientPage
      faculty={faculty}
      subjects={subjects}
      assignments={assignments}
    />
  )
}