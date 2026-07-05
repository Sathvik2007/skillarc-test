import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { FacultyClientPage } from "./faculty-client"
import { ROLES } from "@/constants/roles"

export default async function FacultyPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: userProfile } = await supabase
    .from("users")
    .select("role, institution_id")
    .eq("id", user.id)
    .single()

  if (userProfile?.role !== ROLES.INSTITUTION_ADMIN) {
    redirect("/dashboard")
  }

  const institutionId = userProfile.institution_id

  const [facultyRes, facultySubjectsRes, sectionsRes, departmentsRes] = await Promise.all([
    supabase
      .from("users")
      .select(`
        *,
        department:department_id(
          id,
          name
        )
      `)
      .eq("institution_id", institutionId)
      .eq("role", ROLES.FACULTY)
      .order("name"),
    supabase
      .from("faculty_subjects")
      .select("faculty_id, subject_id"),
    supabase
      .from("sections")
      .select("id, faculty_advisor_id")
      .eq("institution_id", institutionId),
    supabase
      .from("departments")
      .select("id, name")
      .eq("institution_id", institutionId)
      .order("name"),
  ])

  const faculty = facultyRes.data ?? []
  const facultySubjects = facultySubjectsRes.data ?? []
  const sections = sectionsRes.data ?? []
  const departments = departmentsRes.data ?? []

  const facultyWithStats = faculty.map((f) => ({
    ...f,
    assignedSubjects: facultySubjects.filter((fs) => fs.faculty_id === f.id).length,
    assignedSections: sections.filter((s) => s.faculty_advisor_id === f.id).length,
  }))

  return (
    <FacultyClientPage
      initialFaculty={facultyWithStats}
      departments={departments}
      institutionId={institutionId}
    />
  )
}