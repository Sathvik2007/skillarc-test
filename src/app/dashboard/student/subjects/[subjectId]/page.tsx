import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { ROLES } from "@/constants/roles"
import { StudentSubjectDetailClient } from "./student-subject-detail-client"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{
    subjectId: string
  }>
}

export default async function StudentSubjectDetailPage({ params }: PageProps) {
  const { subjectId } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, role, institution_id, section_id")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== ROLES.STUDENT) redirect("/dashboard")

  // 1. Fetch Subject Info
  const { data: subject } = await supabase
    .from("subjects")
    .select("id, name, code")
    .eq("id", subjectId)
    .single()

  if (!subject) {
    redirect("/dashboard/student/subjects")
  }

  // 2. Fetch Faculty details for this subject + section from timetable
  const { data: slots } = await supabase
    .from("timetable_slots")
    .select("faculty_id")
    .eq("institution_id", profile.institution_id)
    .eq("section_id", profile.section_id)
    .eq("subject_id", subjectId)
    .limit(1)

  const facultyId = slots?.[0]?.faculty_id
  let facultyName = "Faculty pending"

  if (facultyId) {
    const { data: fac } = await supabase
      .from("users")
      .select("name")
      .eq("id", facultyId)
      .single()
    if (fac) facultyName = fac.name
  }

  // 3. Fetch Assignments for this subject
  const { data: assignments = [] } = await supabase
    .from("assignments")
    .select("*")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false })

  // Filter assignments targeted to this student's section (or globally assigned)
  const studentSectionId = profile.section_id
  const activeAssignments = (assignments ?? []).filter((a: any) => {
    if (!a.section_ids || a.section_ids.length === 0) return true
    return a.section_ids.includes(studentSectionId)
  })

  const assignmentIds = activeAssignments.map((a: any) => a.id)

  // 4. Fetch Student's Submissions for these assignments
  const { data: submissions = [] } = assignmentIds.length
    ? await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", user.id)
        .in("assignment_id", assignmentIds)
    : { data: [] }

  // 5. Fetch Classmates in the same section
  const { data: classmates = [] } = studentSectionId
    ? await supabase
        .from("users")
        .select("id, name, email")
        .eq("role", ROLES.STUDENT)
        .eq("section_id", studentSectionId)
        .order("name")
    : { data: [] }

  // 6. Fetch meetings matching student's section and subject
  const { data: meetings = [] } = await supabase
    .from("meetings")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("section_id", studentSectionId)
    .order("created_at", { ascending: false })

  return (
    <StudentSubjectDetailClient
      studentId={user.id}
      studentName={profile.name}
      studentSectionId={studentSectionId}
      subject={subject}
      facultyName={facultyName}
      assignments={activeAssignments}
      submissions={submissions ?? []}
      classmates={classmates ?? []}
      meetings={meetings ?? []}
    />
  )
}
