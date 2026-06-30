"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase-server"

interface SaveAttendancePayload {
  subjectId: string
  sectionId: string
  attendanceDate: string
  period: number
  records: Record<string, string>
}

function formatStatus(status: string) {
  switch (status?.toUpperCase()) {
    case "PRESENT":
      return "Present"
    case "ABSENT":
      return "Absent"
    case "LATE":
      return "Late"
    default:
      return status ?? ""
  }
}

export async function getExistingAttendanceAction({
  subjectId,
  sectionId,
  attendanceDate,
  period,
}: Omit<SaveAttendancePayload, "records">) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Please sign in again to view attendance." }
  }

  const normalizedPeriod = Number.parseInt(String(period), 10)
  if (Number.isNaN(normalizedPeriod)) {
    return { success: false, error: "Please select a valid period before loading attendance.", exists: false }
  }

  const { data: existingSession, error: sessionLookupError } = await supabase
    .from("attendance_sessions")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("faculty_id", user.id)
    .eq("section_id", sectionId)
    .eq("attendance_date", attendanceDate)
    .eq("period", normalizedPeriod)
    .maybeSingle()

  if (sessionLookupError) {
    return { success: false, error: sessionLookupError.message, exists: false }
  }

  if (!existingSession?.id) {
    return { success: true, exists: false, records: {} }
  }

  const { data: existingRecords = [], error: recordsError } = await supabase
    .from("attendance_records")
    .select("student_id, status")
    .eq("session_id", existingSession.id)

  if (recordsError) {
    return { success: false, error: recordsError.message, exists: false }
  }

  const records = Object.fromEntries(
    (existingRecords as Array<{ student_id: string; status: string }>).map((row) => [row.student_id, formatStatus(row.status)])
  )

  return { success: true, exists: true, sessionId: existingSession.id, records }
}

export async function saveAttendanceAction({
  subjectId,
  sectionId,
  attendanceDate,
  period,
  records,
}: SaveAttendancePayload) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Please sign in again to save attendance." }
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "FACULTY") {
    return { success: false, error: "Only faculty users can save attendance." }
  }

  const normalizedPeriod = Number.parseInt(String(period), 10)
  if (Number.isNaN(normalizedPeriod)) {
    return { success: false, error: "Please select a valid period before saving." }
  }

  const { data: existingSession, error: sessionLookupError } = await supabase
    .from("attendance_sessions")
    .select("id")
    .eq("subject_id", subjectId)
    .eq("faculty_id", user.id)
    .eq("section_id", sectionId)
    .eq("attendance_date", attendanceDate)
    .eq("period", normalizedPeriod)
    .maybeSingle()

  if (sessionLookupError) {
    return { success: false, error: sessionLookupError.message }
  }

  let sessionId = existingSession?.id

  if (!sessionId) {
    const { data: insertedSession, error: insertSessionError } = await supabase
      .from("attendance_sessions")
      .insert({
        subject_id: subjectId,
        faculty_id: user.id,
        section_id: sectionId,
        attendance_date: attendanceDate,
        period: normalizedPeriod,
      })
      .select("id")
      .single()

    if (insertSessionError || !insertedSession?.id) {
      return { success: false, error: insertSessionError?.message ?? "Failed to create attendance session." }
    }

    sessionId = insertedSession.id
  }

  const { error: deleteError } = await supabase
    .from("attendance_records")
    .delete()
    .eq("session_id", sessionId)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  const attendanceRows = Object.entries(records).map(([studentId, status]) => ({
    session_id: sessionId,
    student_id: studentId,
    status: status.toUpperCase(),
  }))

  const { error: insertError } = await supabase
    .from("attendance_records")
    .insert(attendanceRows)

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  revalidatePath("/dashboard/faculty/attendance")

  return { success: true }
}
