import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { ROLES } from "@/constants/roles"
import FacultyProfile from "./components/FacultyProfile"
import FacultySubjects from "./components/FacultySubjects"
import FacultyTimetable from "./components/FacultyTimetable"
import FacultyDashboardClient from "./faculty-dashboard-client"

export default async function FacultyDashboardPage() {
  // Minimal role check — keep this quick and small so the page can stream other sections.
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== ROLES.FACULTY) redirect("/auth/login")

  // Quick minimal fetch for immediate visibility in the client dashboard.
  // Fetch detailed profile (including institution id) first, then run other small queries in parallel.
  const { data: profileInfo } = await supabase.from("users").select("name, role, institution_id").eq("id", user.id).single()

  const [{ data: institution }, { data: assignedSubjects }, { data: timetableRows }, { count: studentCount }] = await Promise.all([
    supabase.from("institutions").select("id, name").eq("id", profileInfo?.institution_id).maybeSingle(),
    supabase.from("faculty_subjects").select("subject_id").eq("faculty_id", user.id).limit(6),
    supabase.from("timetable_slots").select("day, period, section_id, subjects!inner(id, name, code), sections!inner(name)").eq("faculty_id", user.id).limit(6),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("institution_id", profileInfo?.institution_id).eq("role", ROLES.STUDENT),
  ])

  const subjectIds = (assignedSubjects ?? []).map((r: any) => r.subject_id)
  const { data: subjects } = subjectIds.length ? await supabase.from("subjects").select("id, name, code").in("id", subjectIds).limit(6) : { data: [] }

  const timetableSlots = (timetableRows ?? []).map((slot: any) => ({
    day: slot.day,
    period: slot.period,
    section_id: slot.section_id,
    subjects: Array.isArray(slot.subjects) ? slot.subjects[0] : slot.subjects,
    sections: Array.isArray(slot.sections) ? slot.sections[0] : slot.sections,
  }))

  return (
    <div>
      {/* Immediate client-rendered dashboard with minimal data for perceived speed */}
      <FacultyDashboardClient
        faculty={{
          name: profileInfo?.name ?? "",
          email: user.email ?? "",
          institution: institution?.name ?? "",
        }}
        subjects={subjects ?? []}
        studentCount={studentCount ?? 0}
        timetableSlots={timetableSlots ?? []}
      />

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-slate-100" />}>
          <FacultyProfile />
        </Suspense>

        <div className="space-y-6 mt-6">
          <div className="grid gap-4 xl:grid-cols-4">
            <Suspense fallback={<div className="h-24 animate-pulse rounded-xl bg-slate-100 col-span-4" />}>
              <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-sm">Loading stats…</div>
            </Suspense>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 animate-pulse" />}>
              <FacultyTimetable />
            </Suspense>

            <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 animate-pulse" />}>
              <FacultySubjects />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}