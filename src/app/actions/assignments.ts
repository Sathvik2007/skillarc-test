"use server"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createAssignmentAction(data: {
  subject_id: string
  faculty_id: string
  title: string
  description: string
  due_date: string | null
  type: string
  max_score: number
  questions: any | null
  language: string | null
  test_cases: any | null
  section_ids: string[]
  files: string[] | null
}) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from("assignments").insert({
    subject_id: data.subject_id,
    faculty_id: data.faculty_id,
    title: data.title,
    description: data.description,
    due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
    type: data.type,
    max_score: data.max_score,
    questions: data.questions,
    language: data.language,
    test_cases: data.test_cases,
    section_ids: data.section_ids,
    files: data.files,
  })

  if (error) {
    console.error("Error creating assignment:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/faculty/subjects/${data.subject_id}`)
  revalidatePath(`/dashboard/student/subjects/${data.subject_id}`)
  return { success: true }
}

export async function updateAssignmentAction(
  id: string,
  subjectId: string,
  data: Partial<{
    title: string
    description: string
    due_date: string | null
    type: string
    max_score: number
    questions: any | null
    language: string | null
    test_cases: any | null
    section_ids: string[]
    files: string[] | null
  }>
) {
  const supabase = await createSupabaseServerClient()

  // Format due date if present
  const updateData = { ...data } as any
  if (data.due_date) {
    updateData.due_date = new Date(data.due_date).toISOString()
  } else if (data.due_date === null) {
    updateData.due_date = null
  }

  const { error } = await supabase
    .from("assignments")
    .update(updateData)
    .eq("id", id)

  if (error) {
    console.error("Error updating assignment:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/faculty/subjects/${subjectId}`)
  revalidatePath(`/dashboard/student/subjects/${subjectId}`)
  return { success: true }
}

export async function deleteAssignmentAction(id: string, subjectId: string) {
  const supabase = await createSupabaseServerClient()

  // First delete dependent submissions
  const { error: subError } = await supabase
    .from("submissions")
    .delete()
    .eq("assignment_id", id)

  if (subError) {
    console.error("Error deleting submissions for assignment:", subError)
    return { success: false, error: subError.message }
  }

  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting assignment:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/faculty/subjects/${subjectId}`)
  revalidatePath(`/dashboard/student/subjects/${subjectId}`)
  return { success: true }
}

export async function gradeSubmissionAction(
  submissionId: string,
  grade: number,
  feedback: string,
  subjectId: string
) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from("submissions")
    .update({
      grade,
      feedback,
      status: "graded",
    })
    .eq("id", submissionId)

  if (error) {
    console.error("Error grading submission:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/faculty/subjects/${subjectId}`)
  revalidatePath(`/dashboard/student/subjects/${subjectId}`)
  return { success: true }
}

export async function submitAssignmentAction(data: {
  assignment_id: string
  student_id: string
  file_url: string | null
  quiz_answers: any | null
  code_content: string | null
  language: string | null
  grade: number | null
  feedback: string | null
  status: string
  subject_id: string
}) {
  const supabase = await createSupabaseServerClient()

  // Upsert or insert submission
  const { data: existing } = await supabase
    .from("submissions")
    .select("id")
    .eq("assignment_id", data.assignment_id)
    .eq("student_id", data.student_id)
    .maybeSingle()

  let error
  if (existing) {
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        file_url: data.file_url,
        quiz_answers: data.quiz_answers,
        code_content: data.code_content,
        language: data.language,
        grade: data.grade,
        feedback: data.feedback,
        status: data.status,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
    error = updateError
  } else {
    const { error: insertError } = await supabase.from("submissions").insert({
      assignment_id: data.assignment_id,
      student_id: data.student_id,
      file_url: data.file_url,
      quiz_answers: data.quiz_answers,
      code_content: data.code_content,
      language: data.language,
      grade: data.grade,
      feedback: data.feedback,
      status: data.status,
      submitted_at: new Date().toISOString(),
    })
    error = insertError
  }

  if (error) {
    console.error("Error submitting assignment:", error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/dashboard/faculty/subjects/${data.subject_id}`)
  revalidatePath(`/dashboard/student/subjects/${data.subject_id}`)
  return { success: true }
}
