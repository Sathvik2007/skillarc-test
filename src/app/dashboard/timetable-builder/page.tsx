"use client"

import { useState } from "react"
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { TimetableProvider, useTimetable } from "@/modules/timetable/context/timetable-context"
import SubjectPanel from "@/modules/timetable/components/subject-panel"
import TimetableGrid from "@/modules/timetable/components/timetable-grid"
import FacultyPanel from "@/modules/timetable/components/faculty-panel"
import { supabase } from "@/lib/supabase"

const DRAG_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  DAA:    { bg: "#dbeafe", border: "#bfdbfe", text: "#1d4ed8" },
  DCN:    { bg: "#ede9fe", border: "#ddd6fe", text: "#6d28d9" },
  WT:     { bg: "#fef3c7", border: "#fde68a", text: "#b45309" },
  TOC:    { bg: "#ffedd5", border: "#fed7aa", text: "#c2410c" },
  "OE I": { bg: "#d1fae5", border: "#a7f3d0", text: "#065f46" },
  "P&T":  { bg: "#fce7f3", border: "#fbcfe8", text: "#9d174d" },
  TDPCL:  { bg: "#ccfbf1", border: "#99f6e4", text: "#0f766e" },
}
const DEFAULT_DRAG = { bg: "#dbeafe", border: "#bfdbfe", text: "#1d4ed8" }

function DragPreview({ subject }: { subject: any }) {
  const c = DRAG_COLORS[subject.code] ?? DEFAULT_DRAG
  return (
    <div style={{
      backgroundColor: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      padding: "10px 12px",
      width: 176,
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      transform: "rotate(2deg)",
      fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
    }}>
      <p style={{ fontWeight: 700, fontSize: 12, color: c.text }}>{subject.code}</p>
      <p style={{ fontSize: 10, color: "#6b7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subject.name}</p>
      <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{subject.faculty}</p>
    </div>
  )
}

function Builder() {
  const { assignSubject } = useTimetable()
  const [activeSubject, setActiveSubject] = useState<any>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveSubject(e.active.data.current)}
      onDragEnd={async (e) => {
        setActiveSubject(null)

        if (!e.over) return

        const subject = e.active.data.current
        const [day, period] = (e.over.id as string).split("-")

        // Update UI state immediately
        assignSubject(day, period, subject)

        // Persist to Supabase
        const { error } = await supabase.from("timetable_slots").insert({
          institution_id: "demo-institution-id",
          day,
          period: Number(period),
          subject_id: subject.id,
          teacher_id: subject.teacher_id,
        })

        if (error) {
          console.error("Failed to save timetable slot:", error.message)
        }
      }}
      onDragCancel={() => setActiveSubject(null)}
    >
      <div style={{
        display: "grid",
        gridTemplateColumns: "272px 1fr 272px",
        gap: 16,
        alignItems: "start",
      }}>
        <SubjectPanel />
        <TimetableGrid />
        <FacultyPanel />
      </div>

      <DragOverlay dropAnimation={{ duration: 160, easing: "ease" }}>
        {activeSubject && <DragPreview subject={activeSubject} />}
      </DragOverlay>
    </DndContext>
  )
}

export default function TimetableBuilderPage() {
  return (
    <TimetableProvider>
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#f4f5f7",
        padding: 24,
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>
            Timetable Builder
          </h1>
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            Drag subjects from the sidebar into the grid
          </p>
        </div>

        <Builder />
      </div>
    </TimetableProvider>
  )
}