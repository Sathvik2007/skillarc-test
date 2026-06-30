import { redirect } from "next/navigation"
import { BookOpen, GraduationCap, UserRound } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { ROLES } from "@/constants/roles"

export const dynamic = "force-dynamic"

export default async function StudentSubjectsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("users")
    .select("id, role, institution_id, section_id")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== ROLES.STUDENT) redirect("/dashboard")

  const { data: timetableRows = [] } = profile.section_id
    ? await supabase
        .from("timetable_slots")
        .select("subject_id, faculty_id")
        .eq("institution_id", profile.institution_id)
        .eq("section_id", profile.section_id)
        .order("subject_id")
    : { data: [] }

  const subjectIds = Array.from(new Set((timetableRows as Array<any>).map((slot) => slot.subject_id).filter(Boolean))) as string[]

  const { data: subjectRows = [] } = subjectIds.length
    ? await supabase.from("subjects").select("id, name, code").in("id", subjectIds).order("name")
    : { data: [] }

  const facultyIds = Array.from(new Set((timetableRows as Array<any>).map((slot) => slot.faculty_id).filter(Boolean))) as string[]
  const facultyMap = new Map<string, string>()
  if (facultyIds.length) {
    const { data: facultyRows = [] } = await supabase.from("users").select("id, name").in("id", facultyIds)
    ;(facultyRows as Array<any>).forEach((faculty) => facultyMap.set(faculty.id, faculty.name))
  }

  const subjects = (subjectRows as Array<any>).map((subject) => ({
    id: subject.id,
    name: subject.name,
    code: subject.code,
    facultyName: facultyMap.get((timetableRows as Array<any>).find((slot: any) => slot.subject_id === subject.id)?.faculty_id) ?? "Faculty pending",
  }))

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={{ margin: 0, color: "#4f46e5", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>Academic subjects</p>
        <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: "#111827" }}>Your enrolled subjects</h1>
        <p style={{ margin: "6px 0 0", color: "#6b7280", maxWidth: 640 }}>Subjects linked to your section and the faculty teaching them.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {subjects.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #ece7ff", borderRadius: 18, padding: 28, textAlign: "center", color: "#6b7280" }}>
            No subjects are currently assigned to your section.
          </div>
        ) : (
          subjects.map((subject) => (
            <div key={subject.id} style={{ background: "#fff", border: "1px solid #ece7ff", borderRadius: 18, padding: 18, boxShadow: "0 10px 25px rgba(79,70,229,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <BookOpen size={18} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", background: "#eef2ff", borderRadius: 999, padding: "4px 8px" }}>{subject.code}</span>
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#111827" }}>{subject.name}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7280", marginTop: 8 }}>
                <UserRound size={15} />
                <span>{subject.facultyName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7280", marginTop: 8 }}>
                <GraduationCap size={15} />
                <span>Section-linked subject</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
