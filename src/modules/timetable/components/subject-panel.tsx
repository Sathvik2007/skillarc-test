"use client"

import SubjectCard from "./subject-card"

const subjects = [
  { id: "1", code: "DAA",   name: "Design & Analysis of Algorithms", faculty: "Dr. Sam",   type: "THEORY" },
  { id: "2", code: "DCN",   name: "Data Communication Networks",      faculty: "Dr. Senr",  type: "THEORY" },
  { id: "3", code: "WT",    name: "Web Technology",                   faculty: "Dr. Minus", type: "LAB", periods: 2 },
  { id: "4", code: "TOC",   name: "Theory of Computation",            faculty: "Dr. Sam",   type: "THEORY" },
  { id: "5", code: "OE I",  name: "Open Elective I",                  faculty: "Dr. Senr",  type: "THEORY" },
  { id: "6", code: "P&T",   name: "Probability & Transforms",         faculty: "Dr. Teach", type: "THEORY" },
  { id: "7", code: "TDPCL", name: "TDPCL",                            faculty: "Dr. Minus", type: "THEORY" },
]

const panel: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 16,
  border: "1px solid #f3f4f6",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
  height: "100%",
}

export default function SubjectPanel() {
  return (
    <div style={panel}>
      {/* Header */}
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>Subjects</p>
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Sem IV · Section A</p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600, color: "#6b7280",
            backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: 999,
          }}>
            {subjects.length}
          </span>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search subjects…"
            style={{
              width: "100%", paddingLeft: 28, paddingRight: 10, paddingTop: 6, paddingBottom: 6,
              fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb", color: "#374151", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 10 }}>
        {subjects.map((s) => (
          <SubjectCard key={s.id} subject={s} />
        ))}
      </div>

      {/* Footer hint */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 6 }}>
        <svg style={{ width: 12, height: 12, color: "#9ca3af", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        <p style={{ fontSize: 10, color: "#9ca3af" }}>Drag cards into the grid</p>
      </div>
    </div>
  )
}