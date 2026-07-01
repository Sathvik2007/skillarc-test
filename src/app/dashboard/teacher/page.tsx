import { createSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ROLES } from "@/constants/roles"
import TeacherDashboardClient from "./teacher-dashboard-client"

export default async function TeacherDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("users")
    .select("role, institution_id")
    .eq("id", user.id)
    .single()

  if (profile?.role !== ROLES.FACULTY) redirect("/auth/login")

  const { data: institution } = await supabase
    .from("institutions")
    .select("id, name")
    .eq("id", profile.institution_id)
    .single()

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, code")
    .eq("teacher_id", user.id)

  const { count: studentCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("institution_id", profile.institution_id)
    .eq("role", ROLES.STUDENT)

  return (
    <TeacherDashboardClient
      teacher={{ email: user.email ?? "", institution: institution?.name ?? "" }}
      subjects={subjects ?? []}
      studentCount={studentCount ?? 0}
    />
  )
}