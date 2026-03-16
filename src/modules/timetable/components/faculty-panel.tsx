"use client"

const FACULTIES = [
  { id: 1, name: "Dr. Sam",   initials: "DS", title: "Professor",       used: 3, total: 5, status: "available" as const, section: "Section A" },
  { id: 2, name: "Dr. Senr",  initials: "DS", title: "Assoc. Professor", used: 4, total: 5, status: "busy"      as const, section: "Section B" },
  { id: 3, name: "Dr. Minus", initials: "DM", title: "Lecturer",         used: 2, total: 4, status: "available" as const, section: "Section A" },
  { id: 4, name: "Dr. Teach", initials: "DT", title: "Assoc. Professor", used: 5, total: 5, status: "full"      as const, section: "Section C" },
]

const STATUS = {
  available: { dot: "#34d399", bg: "#d1fae5", text: "#065f46", label: "AVAILABLE" },
  busy:      { dot: "#fbbf24", bg: "#fef3c7", text: "#92400e", label: "BUSY" },
  full:      { dot: "#f87171", bg: "#fee2e2", text: "#991b1b", label: "FULL" },
}

function barColor(used: number, total: number) {
  const r = used / total
  if (r >= 1)   return "#f87171"
  if (r >= 0.7) return "#fbbf24"
  return "#34d399"
}

const font = "'Plus Jakarta Sans', 'DM Sans', sans-serif"

export default function FacultyPanel() {
  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: 16,
      border: "1px solid #f3f4f6",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: font,
      height: "100%",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>Faculty</p>
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Sem IV · Sec A</p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600, color: "#6b7280",
            backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: 999,
          }}>
            {FACULTIES.length} members
          </span>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {FACULTIES.map((f) => {
          const pct = Math.round((f.used / f.total) * 100)
          const sc = STATUS[f.status]
          const bc = barColor(f.used, f.total)

          return (
            <div key={f.id} style={{
              borderRadius: 12,
              border: "1px solid #f3f4f6",
              backgroundColor: "#fafafa",
              padding: 12,
            }}>
              {/* Name row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "linear-gradient(135deg, #e0e7ff, #bfdbfe)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#4338ca" }}>{f.initials}</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 12, color: "#111827", lineHeight: 1.2 }}>{f.name}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af" }}>{f.title}</p>
                  </div>
                </div>

                {/* Status badge */}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "2px 6px", borderRadius: 6,
                  fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                  backgroundColor: sc.bg, color: sc.text, flexShrink: 0,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: sc.dot, display: "inline-block" }} />
                  {sc.label}
                </span>
              </div>

              {/* Workload bar */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#9ca3af" }}>Workload</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#374151" }}>{f.used} / {f.total} hrs</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, backgroundColor: "#e5e7eb", overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", borderRadius: 999, backgroundColor: bc, width: `${pct}%`, transition: "width 0.5s" }} />
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: "#9ca3af" }}>{f.section}</span>
                <span style={{ fontSize: 10, color: "#6b7280" }}>
                  Remaining: <strong>{f.total - f.used} hrs</strong>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}