"use client"

import { Fragment } from "react"
import TimetableCell from "./timetable-cell"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const PERIODS = [
  { id: "P1", label: "Period 1", time: "8:45 – 9:45" },
  { id: "P2", label: "Period 2", time: "9:45 – 10:45" },
  { id: "P3", label: "Period 3", time: "11:00 – 12:00" },
  { id: "P4", label: "Period 4", time: "12:00 – 1:00" },
  { id: "P5", label: "Period 5", time: "2:00 – 3:00" },
]

const font = "'Plus Jakarta Sans', 'DM Sans', sans-serif"

const headerCell: React.CSSProperties = {
  backgroundColor: "#f9fafb", border: "1px solid #f3f4f6",
  borderRadius: 10, padding: "6px 10px", textAlign: "center",
}

const dayLabelCell: React.CSSProperties = {
  backgroundColor: "#f9fafb", border: "1px solid #f3f4f6",
  borderRadius: 10, padding: "0 12px",
  display: "flex", alignItems: "center", height: 80,
}

export default function TimetableGrid() {
  return (
    <div style={{
      backgroundColor: "#ffffff", borderRadius: 16,
      border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      padding: 20, minWidth: 0, fontFamily: font,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>Timetable Builder</p>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Drag subjects from the sidebar into the grid</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {/* placeholder dropdowns removed because the selector flow controls program/semester/section */}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `112px repeat(${PERIODS.length}, minmax(0, 1fr))`,
          gap: 6,
        }}>
          {/* Header row */}
          <div style={{ ...headerCell, textAlign: "left" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Day</p>
            <p style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>/ Time</p>
          </div>
          {PERIODS.map((p) => (
            <div key={p.id} style={headerCell}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#374151" }}>{p.label}</p>
              <p style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>{p.time}</p>
            </div>
          ))}

          {/* Day rows — Fragment fixes the missing key warning */}
          {DAYS.map((day) => (
            <Fragment key={day}>
              <div style={dayLabelCell}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{day}</span>
              </div>
              {PERIODS.map((p) => (
                <TimetableCell key={`${day}-${p.id}`} day={day} period={p.id} />
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}