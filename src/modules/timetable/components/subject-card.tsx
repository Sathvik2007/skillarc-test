"use client"

import { useDraggable } from "@dnd-kit/core"

// All colors as inline style values — never purged by Tailwind
const COLORS: Record<string, { bg: string; border: string; badgeBg: string; badgeText: string }> = {
  DAA:    { bg: "#dbeafe", border: "#bfdbfe", badgeBg: "#bfdbfe", badgeText: "#1d4ed8" },
  DCN:    { bg: "#ede9fe", border: "#ddd6fe", badgeBg: "#ddd6fe", badgeText: "#6d28d9" },
  WT:     { bg: "#fef3c7", border: "#fde68a", badgeBg: "#fde68a", badgeText: "#b45309" },
  TOC:    { bg: "#ffedd5", border: "#fed7aa", badgeBg: "#fed7aa", badgeText: "#c2410c" },
  "OE I": { bg: "#d1fae5", border: "#a7f3d0", badgeBg: "#a7f3d0", badgeText: "#065f46" },
  "P&T":  { bg: "#fce7f3", border: "#fbcfe8", badgeBg: "#fbcfe8", badgeText: "#9d174d" },
  TDPCL:  { bg: "#ccfbf1", border: "#99f6e4", badgeBg: "#99f6e4", badgeText: "#0f766e" },
}
const DEFAULT = { bg: "#dbeafe", border: "#bfdbfe", badgeBg: "#bfdbfe", badgeText: "#1d4ed8" }
const LAB_STYLE = { bg: "#ffedd5", border: "#fed7aa", badgeBg: "#ffedd5", badgeText: "#c2410c" }

export default function SubjectCard({ subject }: { subject: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: subject.id,
    data: subject,
  })

  const dragStyle = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 999 }
    : {}

  const c = COLORS[subject.code] ?? DEFAULT
  const isLab = subject.type === "LAB"
  const badgeC = isLab ? LAB_STYLE : c

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...dragStyle,
        backgroundColor: c.bg,
        borderColor: c.border,
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 12,
        padding: "12px",
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.45 : 1,
        transform: dragStyle.transform ?? (isDragging ? "rotate(1deg) scale(0.97)" : undefined),
        boxShadow: isDragging ? "0 20px 40px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.15s, transform 0.15s",
        userSelect: "none",
        position: "relative",
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      }}
    >
      {/* Drag handle dots */}
      <div style={{ position: "absolute", top: 10, right: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, opacity: 0.3 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#6b7280" }} />
        ))}
      </div>

      {/* Code */}
      <p style={{ fontWeight: 700, fontSize: 13, color: "#1f2937", marginBottom: 2, paddingRight: 20 }}>
        {subject.code}
      </p>

      {/* Name */}
      <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, paddingRight: 20, lineHeight: 1.4 }}>
        {subject.name}
      </p>

      {/* Faculty */}
      <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>
        {subject.faculty}
      </p>

      {/* Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          display: "inline-block",
          padding: "2px 7px",
          borderRadius: 6,
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          backgroundColor: badgeC.badgeBg,
          color: badgeC.badgeText,
          border: `1px solid ${badgeC.border}`,
        }}>
          {isLab ? "LAB" : "THEORY"}
        </span>
        {subject.periods && (
          <span style={{ fontSize: 10, color: "#9ca3af" }}>{subject.periods}–{subject.periods + 1} periods</span>
        )}
      </div>
    </div>
  )
}