import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { ROLES } from "@/constants/roles"
import { FacultySubjectDetailClient } from "./faculty-subject-detail-client"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{
    subjectId: string
  }>
}

export default async function FacultySubjectDetailPage({ params }: PageProps) {
  const { subjectId } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("users")
    .select("role, institution_id, name")
    .eq("id", user.id)
    .single()

  if (profile?.role !== ROLES.FACULTY) redirect("/dashboard")

  // 1. Fetch Subject Info
  const { data: subject } = await supabase
    .from("subjects")
    .select("id, name, code")
    .eq("id", subjectId)
    .single()

  if (!subject) {
    redirect("/dashboard/faculty/subjects")
  }

  // 2. Fetch Sections taught by this faculty for this subject
  const { data: slots } = await supabase
    .from("timetable_slots")
    .select("section_id, semester")
    .eq("faculty_id", user.id)
    .eq("subject_id", subjectId)

  const sectionIds = Array.from(new Set((slots ?? []).map((s: any) => s.section_id).filter(Boolean))) as string[]

  // Fetch sections details
  const { data: sections = [] } = sectionIds.length
    ? await supabase
        .from("sections")
        .select("id, name")
        .in("id", sectionIds)
    : { data: [] }

  // 3. Fetch Assignments for this subject
  const { data: assignments = [] } = await supabase
    .from("assignments")
    .select("*")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false })

  const assignmentIds = (assignments ?? []).map((a: any) => a.id)

  // 4. Fetch Submissions for these assignments
  const { data: submissions = [] } = assignmentIds.length
    ? await supabase
        .from("submissions")
        .select("*")
        .in("assignment_id", assignmentIds)
    : { data: [] }

  // 5. Fetch Students enrolled in the sections taught
  const { data: students = [] } = sectionIds.length
    ? await supabase
        .from("users")
        .select("id, name, email, section_id")
        .eq("role", ROLES.STUDENT)
        .in("section_id", sectionIds)
        .order("name")
    : { data: [] }

  // 6. Fetch Meetings for this subject
  const { data: meetings = [] } = await supabase
    .from("meetings")
    .select("*")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false })

  return (
    <FacultySubjectDetailClient
      facultyId={user.id}
      facultyName={profile.name}
      institutionId={profile.institution_id}
      subject={subject}
      sections={sections ?? []}
      assignments={assignments ?? []}
      submissions={submissions ?? []}
      students={students ?? []}
      meetings={meetings ?? []}
    />
  )
}
