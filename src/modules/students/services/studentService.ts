import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Student, StudentWithSection, CreateStudentInput, UpdateStudentInput } from "../types/student.types"
import { ROLES } from "@/constants/roles"

export async function createSupabaseStudentClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export async function getStudentsByInstitution(
  institutionId: string
): Promise<StudentWithSection[]> {
  const supabase = await createSupabaseStudentClient()
  const { data, error } = await supabase
    .from("users")
    .select("*, section:section_id(id, name, semester, program_id)")
    .eq("institution_id", institutionId)
    .eq("role", ROLES.STUDENT)
    .order("name")

  if (error) throw new Error(`Failed to fetch students: ${error.message}`)
  return data || []
}

export async function getStudentById(studentId: string): Promise<StudentWithSection> {
  const supabase = await createSupabaseStudentClient()
  const { data, error } = await supabase
    .from("users")
    .select("*, section:section_id(id, name, semester, program_id)")
    .eq("id", studentId)
    .eq("role", ROLES.STUDENT)
    .single()

  if (error) throw new Error(`Failed to fetch student: ${error.message}`)
  return data
}

export async function createStudent(
  input: CreateStudentInput
): Promise<Student> {
  const supabase = await createSupabaseStudentClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password || Math.random().toString(36).slice(-12),
    email_confirm: true,
  })

  if (authError) throw new Error(`Failed to create auth user: ${authError.message}`)

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        id: authData.user.id,
        name: input.name,
        email: input.email,
        role: ROLES.STUDENT,
        institution_id: input.institution_id,
        organization_id: input.organization_id || null,
        section_id: input.section_id,
        semester: input.semester,
        program_id: input.program_id || null,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(`Failed to create student profile: ${error.message}`)
  return data
}

export async function updateStudent(
  studentId: string,
  input: UpdateStudentInput
): Promise<Student> {
  const supabase = await createSupabaseStudentClient()
  const { data, error } = await supabase
    .from("users")
    .update(input)
    .eq("id", studentId)
    .eq("role", ROLES.STUDENT)
    .select()
    .single()

  if (error) throw new Error(`Failed to update student: ${error.message}`)
  return data
}

export async function deleteStudent(studentId: string): Promise<void> {
  const supabase = await createSupabaseStudentClient()
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", studentId)
    .eq("role", ROLES.STUDENT)

  if (error) throw new Error(`Failed to delete student: ${error.message}`)
}

export async function getStudentCount(institutionId: string): Promise<number> {
  const supabase = await createSupabaseStudentClient()
  const { count, error } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("institution_id", institutionId)
    .eq("role", ROLES.STUDENT)

  if (error) throw new Error(`Failed to count students: ${error.message}`)
  return count || 0
}