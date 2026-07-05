import { redirect } from "next/navigation"
import { BookOpen, GraduationCap, Layers } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { ROLES } from "@/constants/roles"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function FacultySubjectsPage() {
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

  const { data: assignmentRows } = await supabase
    .from("faculty_subjects")
    .select("subject_id")
    .eq("faculty_id", user.id)
    .eq("institution_id", profile?.institution_id)

  const subjectIds = (assignmentRows ?? []).map((row: any) => row.subject_id).filter(Boolean)

  const { data: subjectRowsData } = subjectIds.length
    ? await supabase
        .from("subjects")
        .select("id, name, code")
        .in("id", subjectIds)
        .eq("institution_id", profile?.institution_id)
        .order("name")
    : { data: [] }

  const subjectRows = Array.isArray(subjectRowsData) ? subjectRowsData : []

  const { data: timetableRows } = subjectIds.length
    ? await supabase
        .from("timetable_slots")
        .select("subject_id, section_id, semester")
        .eq("faculty_id", user.id)
        .in("subject_id", subjectIds)
        .order("semester")
    : { data: [] }

  const sectionIds = Array.from(
    new Set(
      (timetableRows ?? [])
        .map((row: any) => row.section_id)
        .filter(Boolean) as string[],
    ),
  )

  const { data: sectionsData } = sectionIds.length
    ? await supabase.from("sections").select("id, name").in("id", sectionIds)
    : { data: [] }

  const sectionMap = new Map((Array.isArray(sectionsData) ? sectionsData : []).map((section: any) => [section.id, section.name]))

  const subjectMetaMap = new Map<string, { sectionNames: string[]; semester?: number }>()
  for (const row of timetableRows ?? []) {
    const subjectId = row.subject_id
    const sectionId = row.section_id
    if (!subjectId) continue

    const existing = subjectMetaMap.get(subjectId) ?? { sectionNames: [] }
    if (sectionId) {
      const sectionName = sectionMap.get(sectionId)
      if (sectionName && !existing.sectionNames.includes(sectionName)) {
        existing.sectionNames.push(sectionName)
      }
    }

    if (row.semester != null) {
      existing.semester = row.semester
    }

    subjectMetaMap.set(subjectId, existing)
  }

  const subjects = (subjectRows as Array<any>).map((subject) => {
    const meta = subjectMetaMap.get(subject.id)

    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      sectionName: meta && meta.sectionNames.length ? `Sections: ${meta.sectionNames.join(", ")}` : "No sections scheduled",
      programName: meta?.semester != null ? `Semester ${meta.semester}` : "Semester not assigned",
    }
  })

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ margin: 0, color: "#4f46e5", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>
            Teaching portfolio
          </p>
          <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: "#111827" }}>
            Your assigned subjects
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280", maxWidth: 620 }}>
            A quick overview of the courses you are teaching and the sections that are tied to them.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 999, background: "#f5f3ff", color: "#6d28d9", fontWeight: 600 }}>
          <BookOpen size={18} />
          {subjects.length} subject{subjects.length === 1 ? "" : "s"}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/dashboard/faculty/subjects/${subject.id}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div style={{ background: "#fff", border: "1px solid #ece7ff", borderRadius: 18, padding: 18, boxShadow: "0 10px 25px rgba(79,70,229,0.06)", height: "100%", boxSizing: "border-box", transition: "transform 0.2s, box-shadow 0.2s" }} className="hover:scale-[1.02] hover:shadow-lg">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <GraduationCap size={18} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", background: "#eef2ff", borderRadius: 999, padding: "4px 8px" }}>
                  {subject.code}
                </span>
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#111827" }}>{subject.name}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7280", marginTop: 10 }}>
                <Layers size={15} />
                <span>{subject.sectionName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7280", marginTop: 8 }}>
                <GraduationCap size={15} />
                <span>{subject.programName}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {subjects.length === 0 && (
        <div style={{ background: "#fff", border: "1px solid #ece7ff", borderRadius: 18, padding: 28, textAlign: "center", color: "#6b7280" }}>
          No subjects are currently assigned to you. Contact your institution admin if this looks incorrect.
        </div>
      )}
    </div>
  )
}

