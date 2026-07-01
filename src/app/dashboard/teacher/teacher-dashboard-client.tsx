"use client"

import { useRouter } from "next/navigation"
import { BookOpen, Users, Clock, ChevronRight, GraduationCap, LayoutGrid } from "lucide-react"

const font = "'Plus Jakarta Sans', 'DM Sans', sans-serif"

interface Subject { id: string; name: string; code: string }

export default function TeacherDashboardClient({
  teacher,
  subjects,
  studentCount,
}: {
  teacher: { email: string; institution: string }
  subjects: Subject[]
  studentCount: number
}) {
  const router = useRouter()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const quickActions = [
    { label: "My Subjects",  desc: "View assigned subjects",  icon: "📘", href: "/dashboard/teacher/subjects" },
    { label: "Timetable",    desc: "View your schedule",      icon: "📅", href: "/dashboard/timetable-builder" },
    { label: "Students",     desc: "View your students",      icon: "👩‍🎓", href: "/dashboard/teacher/students" },
    { label: "Attendance",   desc: "Mark attendance",         icon: "✅", href: "/dashboard/teacher/attendance" },
  ]

  return (
    <div style={{ fontFamily: font, maxWidth: 960, margin: "0 auto" }}>

      {/* Header */}
      <div style={{
        backgroundColor: "#fff", borderRadius: 16, padding: "20px 24px",
        border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        marginBottom: 16, display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "linear-gradient(135deg, #065f46, #059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <GraduationCap size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>
            Faculty Dashboard
          </h1>
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>
            {greeting} 👋 &nbsp;·&nbsp; {teacher.institution}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Subjects Assigned", value: subjects.length, accent: "#d1fae5", text: "#065f46", icon: <BookOpen size={17} color="#065f46" /> },
          { label: "Students",          value: studentCount,    accent: "#dbeafe", text: "#1d4ed8", icon: <Users size={17} color="#1d4ed8" /> },
          { label: "Classes Today",     value: 0,               accent: "#fef3c7", text: "#b45309", icon: <Clock size={17} color="#b45309" /> },
        ].map(s => (
          <div key={s.label} style={{
            backgroundColor: "#fff", borderRadius: 14, padding: "16px 20px",
            border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, backgroundColor: s.accent,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.text, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: "#fff", borderRadius: 16, padding: 24,
        border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <LayoutGrid size={15} color="#6b7280" />
          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Quick Actions</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {quickActions.map(a => (
            <div
              key={a.label}
              onClick={() => router.push(a.href)}
              style={{
                border: "1px solid #f3f4f6", borderRadius: 12, padding: "14px 16px",
                cursor: "pointer", transition: "all 0.15s", backgroundColor: "#fafafa",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = "#f0fdf4"
                ;(e.currentTarget as HTMLDivElement).style.borderColor = "#bbf7d0"
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = "#fafafa"
                ;(e.currentTarget as HTMLDivElement).style.borderColor = "#f3f4f6"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{a.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{a.label}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{a.desc}</p>
                </div>
              </div>
              <ChevronRight size={14} color="#d1d5db" />
            </div>
          ))}
        </div>
      </div>

      {/* Subjects list */}
      <div style={{
        backgroundColor: "#fff", borderRadius: 16, padding: 24,
        border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <BookOpen size={15} color="#6b7280" />
          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>My Subjects</p>
        </div>

        {subjects.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "32px 0",
            border: "1.5px dashed #e5e7eb", borderRadius: 12,
          }}>
            <p style={{ fontSize: 13, color: "#9ca3af" }}>No subjects assigned yet</p>
            <p style={{ fontSize: 11, color: "#d1d5db", marginTop: 4 }}>Contact your institution admin</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {subjects.map(s => (
              <div key={s.id} style={{
                border: "1px solid #f3f4f6", borderRadius: 12, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, backgroundColor: "#d1fae5",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <BookOpen size={15} color="#065f46" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{s.name}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{s.code}</p>
                </div>
                <ChevronRight size={14} color="#d1d5db" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}