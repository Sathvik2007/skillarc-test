"use client"

import { Activity, AlertCircle, BookOpen, CalendarDays, CheckCircle2, ChevronRight, Clock, GraduationCap } from "lucide-react"

const font = "'Plus Jakarta Sans', 'DM Sans', sans-serif"

interface Subject {
  id: string
  name: string
  code: string
  facultyName: string
}

interface ScheduleItem {
  day: string
  period: number
  subjectName: string
  subjectCode: string
  facultyName: string
}

interface AttendanceSummary {
  rate: number
  total: number
  present: number
  absent: number
  late: number
}

export default function StudentPage({
  student,
  subjects,
  schedule,
  upcomingSchedule,
  attendance,
}: {
  student: {
    name: string
    email: string
    institution: string
    sectionName: string
    programName: string
    semester: number | null
    registrationNumber: string
    phone: string
    admissionYear: number | null
  }
  subjects: Subject[]
  schedule: ScheduleItem[]
  upcomingSchedule: ScheduleItem[]
  attendance: AttendanceSummary
}) {
  const stats = [
    {
      label: "Attendance rate",
      value: `${attendance.rate}%`,
      sublabel: `${attendance.present}/${attendance.total} marked`,
      accent: "#d1fae5",
      text: "#065f46",
      icon: <Activity size={17} color="#065f46" />,
    },
    {
      label: "Courses enrolled",
      value: subjects.length,
      sublabel: "Live subject list",
      accent: "#ede9fe",
      text: "#6d28d9",
      icon: <BookOpen size={17} color="#6d28d9" />,
    },
    {
      label: "Today’s classes",
      value: schedule.length,
      sublabel: "From your section timetable",
      accent: "#dbeafe",
      text: "#1d4ed8",
      icon: <CalendarDays size={17} color="#1d4ed8" />,
    },
    {
      label: "Section",
      value: student.sectionName || "—",
      sublabel: student.programName || "Program pending",
      accent: "#fef3c7",
      text: "#92400e",
      icon: <GraduationCap size={17} color="#92400e" />,
    },
  ]

  return (
    <div style={{ fontFamily: font, maxWidth: 1040, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: 18, padding: "22px 24px", border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>Student dashboard</h1>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>
                {student.institution} · Welcome, <strong>{student.name}</strong>
              </p>
            </div>
          </div>
          <div style={{ border: "1px solid #ece7ff", background: "#f5f3ff", borderRadius: 999, padding: "8px 12px", color: "#6d28d9", fontSize: 12, fontWeight: 700 }}>
            {student.programName} · Semester {student.semester ?? "—"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
        {stats.map((item) => (
          <div key={item.label} style={{ backgroundColor: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: item.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: item.text, lineHeight: 1, margin: 0 }}>{item.value}</p>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0 0" }}>{item.label}</p>
              <p style={{ fontSize: 10, color: "#6b7280", margin: "2px 0 0" }}>{item.sublabel}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
        <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Today’s classes</h2>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0 0" }}>Based on the latest timetable entries for your section</p>
            </div>
            <div style={{ color: "#4f46e5", fontSize: 11, fontWeight: 700 }}>Live</div>
          </div>

          {schedule.length === 0 ? (
            <div style={{ border: "1.5px dashed #e5e7eb", borderRadius: 12, textAlign: "center", padding: "28px 16px", color: "#9ca3af" }}>
              No class sessions are scheduled for today yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {schedule.map((item) => (
                <div key={`${item.day}-${item.period}`} style={{ border: "1px solid #f3f4f6", borderRadius: 12, padding: 12, display: "flex", gap: 10, alignItems: "center", backgroundColor: "#fafafa" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #e0e7ff, #bfdbfe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#4f46e5", flexShrink: 0 }}>
                    P{item.period}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{item.subjectCode} · {item.subjectName}</h3>
                      <span style={{ fontSize: 10, color: "#9ca3af", display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={11} />{item.period}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#6b7280", margin: "4px 0 0" }}>Faculty: <strong>{item.facultyName}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>My enrolled courses</h2>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0 0" }}>Subjects tied to your section and program</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto", paddingRight: 4 }}>
            {subjects.length === 0 ? (
              <div style={{ border: "1.5px dashed #e5e7eb", borderRadius: 12, textAlign: "center", padding: "30px 12px", color: "#9ca3af" }}>
                No subjects are linked to your section yet.
              </div>
            ) : (
              subjects.map((subject) => (
                <div key={subject.id} style={{ border: "1px solid #f3f4f6", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>📘</div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", margin: 0 }}>{subject.name}</p>
                      <p style={{ fontSize: 10, color: "#9ca3af", margin: "2px 0 0" }}>{subject.code} · {subject.facultyName}</p>
                    </div>
                  </div>
                  <ChevronRight size={13} color="#d1d5db" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Attendance summary</h2>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0 0" }}>Based on the sessions recorded for your section</p>
            </div>
            <div style={{ color: "#16a34a", fontSize: 11, fontWeight: 700 }}>Updated live</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
            <div style={{ backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#166534", fontSize: 12, fontWeight: 700 }}><CheckCircle2 size={13} /> Present</div>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#166534", margin: "6px 0 0" }}>{attendance.present}</p>
            </div>
            <div style={{ backgroundColor: "#fef2f2", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#991b1b", fontSize: 12, fontWeight: 700 }}><AlertCircle size={13} /> Absent</div>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#991b1b", margin: "6px 0 0" }}>{attendance.absent}</p>
            </div>
            <div style={{ backgroundColor: "#eff6ff", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#1d4ed8", fontSize: 12, fontWeight: 700 }}><Clock size={13} /> Late</div>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#1d4ed8", margin: "6px 0 0" }}>{attendance.late}</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Student details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            {[
              ["Email", student.email || "—"],
              ["Registration", student.registrationNumber || "—"],
              ["Phone", student.phone || "—"],
              ["Admission year", student.admissionYear ?? "—"],
            ].map(([label, value]) => (
              <div key={label} style={{ backgroundColor: "#fafafa", borderRadius: 12, padding: 10 }}>
                <p style={{ fontSize: 10, color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                <p style={{ fontSize: 12, color: "#111827", margin: "4px 0 0", fontWeight: 600 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}