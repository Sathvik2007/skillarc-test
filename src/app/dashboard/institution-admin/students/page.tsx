import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { StudentsClientPage } from "./students-client"
import { ROLES } from "@/constants/roles"

export default async function StudentsPage() {
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

  if (userProfile?.role !== ROLES.INSTITUTION_ADMIN) redirect("/dashboard")

  const institutionId = userProfile.institution_id

  // First page + total count for SSR
  const { data: students = [], count } = await supabase
    .from("users")
    .select(`
      *,
      section:section_id(
        id,
        name,
        semester,
        program:program_id(
          id,
          name
        )
      )
    `, { count: "exact" })
    .eq("institution_id", institutionId)
    .eq("role", ROLES.STUDENT)
    .order("name")
    .range(0, 24) // first 25 rows

  const [sectionsRes, programsRes] = await Promise.all([
    supabase
      .from("sections")
      .select(`
        id,
        name,
        semester,
        program_id,
        program:program_id(
          id,
          name
        )
      `)
      .eq("institution_id", institutionId)
      .order("name"),
    supabase
      .from("programs")
      .select("id,name")
      .eq("institution_id", institutionId)
      .order("name"),
  ])

  const sections = sectionsRes.data ?? []
  const programs = programsRes.data ?? []

  return (
    <StudentsClientPage
      initialStudents={students || []}
      initialTotalCount={count ?? 0}
      sections={sections || []}
      programs={programs || []}
      institutionId={institutionId}
    />
  )
}