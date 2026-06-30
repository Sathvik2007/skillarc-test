import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import FacultyDashboardClient from "./faculty-dashboard-client"
import { ROLES } from "@/constants/roles"

export default async function FacultyDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("users")
    .select("name, role, institution_id")
    .eq("id", user.id)
    .single()

  if (profile?.role !== ROLES.FACULTY) redirect("/auth/login")

  const { data: institution } = await supabase
    .from("institutions")
    .select("id, name")
    .eq("id", profile.institution_id)
    .single()

  const { data: assignedSubjects } = await supabase
    .from("faculty_subjects")
    .select("subject_id")
    .eq("faculty_id", user.id)

  const subjectIds = (assignedSubjects ?? []).map((row: any) => row.subject_id)

  const { data: subjects } = subjectIds.length
    ? await supabase.from("subjects").select("id, name, code").in("id", subjectIds)
    : { data: [] }

  const { data: timetableRows } = await supabase
    .from("timetable_slots")
    .select(`
      day,
      period,
      section_id,
      subjects!inner(id, name, code),
      sections!inner(name)
    `)
    .eq("institution_id", profile.institution_id)
    .eq("faculty_id", user.id)
    .order("day")
    .order("period")

  const timetableSlots = (timetableRows ?? []).map((slot: any) => ({
    day: slot.day,
    period: slot.period,
    section_id: slot.section_id,
    subjects: Array.isArray(slot.subjects) ? slot.subjects[0] : slot.subjects,
    sections: Array.isArray(slot.sections) ? slot.sections[0] : slot.sections,
  }))

  const { count: studentCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("institution_id", profile.institution_id)
    .eq("role", ROLES.STUDENT)

  return (
    <FacultyDashboardClient
      faculty={{
        name: profile.name ?? "",
        email: user.email ?? "",
        institution: institution?.name ?? "",
      }}
      subjects={subjects ?? []}
      studentCount={studentCount ?? 0}
      timetableSlots={timetableSlots ?? []}
    />
  )
}