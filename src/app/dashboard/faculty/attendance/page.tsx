import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ROLES } from "@/constants/roles"
import AttendanceClient from "./attendance-client"

export default async function AttendancePage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("users")
    .select("id, role, institution_id")
    .eq("id", user.id)
    .single()

  if (profile?.role !== ROLES.FACULTY) {
    redirect("/dashboard")
  }

  const institutionId = profile.institution_id

  const { data: facultyAssignments } = await supabase
    .from("faculty_subjects")
    .select("subject_id, section_id, semester")
    .eq("faculty_id", user.id)
    .eq("institution_id", institutionId)

  const subjectIds = (facultyAssignments ?? []).map((row: any) => row.subject_id)
  const sectionIds = (facultyAssignments ?? [])
    .map((row: any) => row.section_id)
    .filter(Boolean)

  const { data: programs = [] } = await supabase
    .from("programs")
    .select("id,name")
    .eq("institution_id", institutionId)
    .order("name")

  const { data: sections = [] } = await supabase
    .from("sections")
    .select("id,name,semester,program_id")
    .eq("institution_id", institutionId)
    .order("semester")

  const { data: subjects = [] } = subjectIds.length
    ? await supabase
        .from("subjects")
        .select("id,name,code,semester")
        .in("id", subjectIds)
        .order("semester")
    : { data: [] }

  let studentQuery = supabase
    .from("users")
    .select("id,name,email,role,section_id,program_id,semester,registration_number")
    .eq("institution_id", institutionId)
    .eq("role", ROLES.STUDENT)
    .order("name")

  if (sectionIds.length) {
    studentQuery = studentQuery.in("section_id", sectionIds)
  }

  const { data: students = [] } = await studentQuery

  return (
    <AttendanceClient
      facultyId={user.id}
      institutionId={institutionId}
      programs={programs ?? []}
      sections={sections ?? []}
      subjects={subjects ?? []}
      students={students ?? []}
    />
  )
}