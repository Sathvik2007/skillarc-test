import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import StudentPage from "./student-dashboard-client"
import { ROLES } from "@/constants/roles"

export const dynamic = "force-dynamic"

export default async function Page() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("users")
    .select(
      "id, role, institution_id, name, email, section_id, program_id, semester, registration_number, phone, admission_year"
    )
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== ROLES.STUDENT) redirect("/dashboard")

  const { data: institution } = await supabase
    .from("institutions")
    .select("id, name")
    .eq("id", profile.institution_id)
    .single()

  let sectionName = "Not assigned"
  let programName = "Not assigned"
  let sectionSemester: number | null = null

  if (profile.section_id) {
    const { data: section } = await supabase
      .from("sections")
      .select("id, name, semester, program_id")
      .eq("id", profile.section_id)
      .single()

    if (section) {
      sectionName = section.name ?? "Not assigned"
      sectionSemester = section.semester ?? profile.semester ?? null
      if (section.program_id) {
        const { data: program } = await supabase
          .from("programs")
          .select("id, name")
          .eq("id", section.program_id)
          .single()

        if (program) {
          programName = program.name ?? "Not assigned"
        }
      }
    }
  } else if (profile.program_id) {
    const { data: program } = await supabase
      .from("programs")
      .select("id, name")
      .eq("id", profile.program_id)
      .single()

    if (program) {
      programName = program.name ?? "Not assigned"
    }
  }

  const { data: timetableRowsForSubjects } = profile.section_id
    ? await supabase
        .from("timetable_slots")
        .select("subject_id, faculty_id")
        .eq("institution_id", profile.institution_id)
        .eq("section_id", profile.section_id)
        .order("subject_id")
    : { data: [] }

  const subjectIds = Array.from(
    new Set((timetableRowsForSubjects ?? []).map((slot: any) => slot.subject_id).filter(Boolean))
  ) as string[]

  const { data: subjectRows } = subjectIds.length
    ? await supabase
        .from("subjects")
        .select("id, name, code")
        .in("id", subjectIds)
        .order("name")
    : { data: [] }

  const facultyIds = Array.from(
    new Set((timetableRowsForSubjects ?? []).map((slot: any) => slot.faculty_id).filter(Boolean))
  ) as string[]

  const facultyMap = new Map<string, string>()
  if (facultyIds.length) {
    const { data: facultyRows } = await supabase
      .from("users")
      .select("id, name")
      .in("id", facultyIds)

    ;(facultyRows ?? []).forEach((faculty: any) => {
      facultyMap.set(faculty.id, faculty.name)
    })
  }

  const formattedSubjects = (subjectRows ?? []).map((subject: any) => ({
    id: subject.id,
    name: subject.name,
    code: subject.code,
    facultyName: facultyMap.get((timetableRowsForSubjects ?? []).find((slot: any) => slot.subject_id === subject.id)?.faculty_id) ?? "Faculty pending",
  }))

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" })

  const { data: timetableRows } = profile.section_id
    ? await supabase
        .from("timetable_slots")
        .select("day, period, subject_id, faculty_id")
        .eq("institution_id", profile.institution_id)
        .eq("section_id", profile.section_id)
        .order("day")
        .order("period")
    : { data: [] }

  const subjectMap = new Map((subjectRows ?? []).map((subject: any) => [subject.id, subject]))

  const schedule = (timetableRows ?? []).map((slot: any) => ({
    day: slot.day,
    period: slot.period,
    subjectName: subjectMap.get(slot.subject_id)?.name ?? "Subject pending",
    subjectCode: subjectMap.get(slot.subject_id)?.code ?? "—",
    facultyName: facultyMap.get(slot.faculty_id) ?? "Faculty pending",
  }))

  const todaySchedule = schedule.filter((slot) => slot.day === todayName)
  const upcomingSchedule = schedule.filter((slot) => slot.day !== todayName).slice(0, 4)

  const { data: attendanceSessions } = profile.section_id
    ? await supabase
        .from("attendance_sessions")
        .select("id")
        .eq("section_id", profile.section_id)
    : { data: [] }

  const sessionIds = (attendanceSessions ?? []).map((session: any) => session.id).filter(Boolean)

  const { data: attendanceRecords } = sessionIds.length
    ? await supabase
        .from("attendance_records")
        .select("status")
        .eq("student_id", user.id)
        .in("session_id", sessionIds)
    : { data: [] }

  const totalAttendance = attendanceRecords?.length ?? 0
  const presentCount = (attendanceRecords ?? []).filter((record: any) => record.status === "PRESENT").length
  const absentCount = (attendanceRecords ?? []).filter((record: any) => record.status === "ABSENT").length
  const lateCount = (attendanceRecords ?? []).filter((record: any) => record.status === "LATE").length
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

  return (
    <StudentPage
      student={{
        name: profile.name ?? user.email ?? "Student",
        email: profile.email ?? user.email ?? "",
        institution: institution?.name ?? "Institution",
        sectionName,
        programName,
        semester: sectionSemester ?? profile.semester ?? null,
        registrationNumber: profile.registration_number ?? "",
        phone: profile.phone ?? "",
        admissionYear: profile.admission_year ?? null,
      }}
      subjects={formattedSubjects}
      schedule={todaySchedule}
      upcomingSchedule={upcomingSchedule}
      attendance={{
        rate: attendanceRate,
        total: totalAttendance,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
      }}
    />
  )
}