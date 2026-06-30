"use client"

import { Trash2, BookMarked, GraduationCap, BookOpen, Target, Edit2, Building2, Layers } from "lucide-react"

const font = "'Plus Jakarta Sans', 'DM Sans', sans-serif"

const typeConfig: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
  THEORY:   { label: "Theory",   icon: "📖", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  LAB:      { label: "Lab",      icon: "🧪", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  ELECTIVE: { label: "Elective", icon: "🎯", color: "#9333ea", bg: "#fdf4ff", border: "#e9d5ff" },
}

function getProgramColor(name: string | undefined): { color: string; bg: string; border: string } {
  if (!name) return { color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" }
  const n = name.toLowerCase()
  if (n.includes("cse") || n.includes("computer"))   return { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" }
  if (n.includes("ai") || n.includes("artificial"))  return { color: "#9333ea", bg: "#fdf4ff", border: "#e9d5ff" }
  if (n.includes("ece") || n.includes("electronic")) return { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" }
  if (n.includes("mba") || n.includes("business"))   return { color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" }
  if (n.includes("mech"))                            return { color: "#a16207", bg: "#fefce8", border: "#fef08a" }
  if (n.includes("civil"))                           return { color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" }
  const palette = [
    { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    { color: "#9333ea", bg: "#fdf4ff", border: "#e9d5ff" },
    { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    { color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
  ]
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return palette[hash % palette.length]
}

export function SubjectsList({ subjects, onDelete, onEdit }: any) {
  if (!subjects?.length) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "64px 24px", border: "1.5px dashed #e5e7eb", borderRadius: 20,
        backgroundColor: "#fafafa", fontFamily: font,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
        }}>
          <BookMarked size={24} color="#fff" />
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>No subjects yet</p>
        <p style={{ fontSize: 13, color: "#9ca3af" }}>Create a subject to get started</p>
      </div>
    )
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
      gap: 16,
      fontFamily: font,
    }}>
      {subjects.map((subject: any) => {
        const type = typeConfig[subject.subject_type] ?? typeConfig.THEORY
        const progColor = getProgramColor(subject.program?.name)

        return (
          <div
            key={subject.id}
            style={{
              backgroundColor: "#fff", borderRadius: 16,
              border: "1px solid #f3f4f6",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              overflow: "hidden", transition: "box-shadow 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"
              ;(e.currentTarget as HTMLDivElement).style.borderColor = "#e0e7ff"
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"
              ;(e.currentTarget as HTMLDivElement).style.borderColor = "#f3f4f6"
            }}
          >
            {/* Top accent bar */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${type.color}, ${type.color}55)` }} />

            <div style={{ padding: "18px 20px 0" }}>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  backgroundColor: type.bg, border: `1px solid ${type.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>
                  {type.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{
                    fontSize: 15, fontWeight: 800, color: "#111827",
                    letterSpacing: "-0.01em", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {subject.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "#6b7280",
                      backgroundColor: "#f3f4f6", padding: "2px 7px", borderRadius: 20, letterSpacing: "0.05em",
                    }}>
                      {subject.code}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: type.color, backgroundColor: type.bg,
                      border: `1px solid ${type.border}`,
                      padding: "2px 7px", borderRadius: 20, letterSpacing: "0.04em",
                    }}>
                      {type.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>

                {/* Department */}
                {subject.program?.department?.name && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    backgroundColor: "#f8fafc", borderRadius: 10, padding: "9px 12px",
                  }}>
                    <Building2 size={13} color="#6b7280" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Department</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {subject.program.department.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Program */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  backgroundColor: progColor.bg, border: `1px solid ${progColor.border}`,
                  borderRadius: 10, padding: "9px 12px",
                }}>
                  <GraduationCap size={13} color={progColor.color} style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: progColor.color, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em" }}>Program</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: progColor.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {subject.program?.name ?? "Not Assigned"}
                    </p>
                  </div>
                </div>

                {/* Semester + Credits */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    backgroundColor: "#f8fafc", borderRadius: 10, padding: "9px 12px",
                  }}>
                    <BookOpen size={13} color="#6b7280" style={{ flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Semester</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                        Semester {subject.semester}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    backgroundColor: "#f8fafc", borderRadius: 10, padding: "9px 12px",
                  }}>
                    <Target size={13} color="#6b7280" style={{ flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Credits</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{subject.credits} Credits</p>
                    </div>
                  </div>
                </div>

                {/* Credit dot bar */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  backgroundColor: "#f8fafc", borderRadius: 10, padding: "9px 12px",
                }}>
                  <Layers size={13} color="#6b7280" style={{ flexShrink: 0 }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Credit weight</p>
                    <div style={{ display: "flex", gap: 3 }}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{
                          width: 8, height: 8, borderRadius: "50%",
                          backgroundColor: i < subject.credits ? "#6366f1" : "#e5e7eb",
                        }} />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", borderTop: "1px solid #f3f4f6" }}>
              <button
                onClick={() => onEdit?.(subject)}
                style={{
                  flex: 1, padding: "11px 0",
                  fontSize: 12, fontWeight: 600, color: "#374151",
                  backgroundColor: "transparent", border: "none",
                  borderRight: "1px solid #f3f4f6",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6,
                  transition: "background 0.15s", fontFamily: font,
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Edit2 size={13} color="#6b7280" /> Edit
              </button>
              <button
                onClick={() => onDelete(subject.id)}
                style={{
                  flex: 1, padding: "11px 0",
                  fontSize: 12, fontWeight: 600, color: "#ef4444",
                  backgroundColor: "transparent", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6,
                  transition: "background 0.15s", fontFamily: font,
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fff1f2")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}