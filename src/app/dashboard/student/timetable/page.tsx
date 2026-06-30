import { redirect } from "next/navigation"
import { CalendarDays, Clock3, MapPin } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { ROLES } from "@/constants/roles"

export const dynamic = "force-dynamic"

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const PERIOD_LABELS: Record<number, string> = {
  1: "8:45 – 9:45",
  2: "9:45 – 10:45",
  3: "11:00 – 12:00",
  4: "12:00 – 1:00",
  5: "2:00 – 3:00",
}

export default async function StudentTimetablePage() {
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
        .select("day, period, subject_id, faculty_id")
        .eq("institution_id", profile.institution_id)
        .eq("section_id", profile.section_id)
        .order("day")
        .order("period")
    : { data: [] }

  const subjectIds = Array.from(new Set((timetableRows as Array<any>).map((slot) => slot.subject_id).filter(Boolean))) as string[]
  const subjectMap = new Map<string, { name: string; code: string }>()
  if (subjectIds.length) {
    const { data: subjectRows = [] } = await supabase.from("subjects").select("id, name, code").in("id", subjectIds)
    ;(subjectRows as Array<any>).forEach((subject) => subjectMap.set(subject.id, { name: subject.name, code: subject.code }))
  }

  const facultyIds = Array.from(new Set((timetableRows as Array<any>).map((slot) => slot.faculty_id).filter(Boolean))) as string[]
  const facultyMap = new Map<string, string>()
  if (facultyIds.length) {
    const { data: facultyRows = [] } = await supabase.from("users").select("id, name").in("id", facultyIds)
    ;(facultyRows as Array<any>).forEach((faculty) => facultyMap.set(faculty.id, faculty.name))
  }

  const timetableByDay = DAY_ORDER.map((day) => ({
    day,
    slots: (timetableRows as Array<any>)
      .filter((slot) => slot.day === day)
      .map((slot) => {
        const subject = subjectMap.get(slot.subject_id)
        return {
          period: slot.period,
          subject: subject?.code ?? "Class",
          subjectName: subject?.name ?? "Subject pending",
          faculty: facultyMap.get(slot.faculty_id) ?? "Faculty pending",
          time: `Period ${slot.period} · ${PERIOD_LABELS[slot.period] ?? "TBD"}`,
        }
      })
      .sort((a, b) => a.period - b.period),
  })).filter((dayEntry) => dayEntry.slots.length > 0)

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ margin: 0, color: "#4f46e5", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>Weekly schedule</p>
          <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: "#111827" }}>Your timetable</h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280", maxWidth: 640 }}>The current weekly timetable for your section, pulled from live class data.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 999, background: "#ecfeff", color: "#0f766e", fontWeight: 600 }}>
          <CalendarDays size={18} />
          {timetableByDay.reduce((count, day) => count + day.slots.length, 0)} sessions
        </div>
      </div>

      {timetableByDay.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #ece7ff", borderRadius: 18, padding: 28, textAlign: "center", color: "#6b7280" }}>
          No timetable entries have been assigned to your section yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {timetableByDay.map((dayEntry) => (
            <div key={dayEntry.day} style={{ background: "#fff", border: "1px solid #ece7ff", borderRadius: 20, padding: 18, boxShadow: "0 10px 25px rgba(79,70,229,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>{dayEntry.day}</h2>
                <span style={{ color: "#6b7280", fontWeight: 600, fontSize: 13 }}>{dayEntry.slots.length} classes</span>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {dayEntry.slots.map((slot) => (
                  <div key={`${dayEntry.day}-${slot.period}`} style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", border: "1px solid #f3f4f6", borderRadius: 14, padding: "12px 14px", background: "#fafafa" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ede9fe", color: "#5b21b6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Clock3 size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#111827" }}>{slot.subject} · {slot.subjectName}</div>
                        <div style={{ color: "#6b7280", fontSize: 13 }}>{slot.time}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#4b5563" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={15} />
                        <span>{slot.faculty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
