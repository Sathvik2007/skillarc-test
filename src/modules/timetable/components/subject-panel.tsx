"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTimetable } from "../context/timetable-context"
import SubjectCard from "./subject-card"
import { supabase } from "@/lib/supabase"

const font = "'Plus Jakarta Sans', 'DM Sans', sans-serif"

export default function SubjectPanel() {
  const { subjects, loading } = useTimetable()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const [sectionName, setSectionName] = useState<string | null>(null)

  const semester = searchParams.get("semester")
  const sectionId = searchParams.get("section")

  useEffect(() => {
    let active = true

    async function loadSectionName() {
      if (!sectionId) {
        if (active) setSectionName(null)
        return
      }

      const { data } = await supabase
        .from("sections")
        .select("name")
        .eq("id", sectionId)
        .single()

      if (active) setSectionName(data?.name ?? null)
    }

    loadSectionName()

    return () => {
      active = false
    }
  }, [sectionId])

  const filtered = subjects.filter(
    (s) =>
      s.code.toLowerCase().includes(query.toLowerCase()) ||
      s.name.toLowerCase().includes(query.toLowerCase())
  )

  const subtitle = semester || sectionId
    ? `${semester ? `Semester ${semester}` : "Semester"}${sectionName ? ` · Section ${sectionName}` : sectionId ? " · Section selected" : ""}`
    : "Select a section"

  return (
    <div style={{
      backgroundColor: "#ffffff", borderRadius: 16,
      border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column", overflow: "hidden",
      fontFamily: font, height: "100%",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>Subjects</p>
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{subtitle}</p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600, color: "#6b7280",
            backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: 999,
          }}>
            {filtered.length}
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "#9ca3af" }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search subjects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%", paddingLeft: 28, paddingRight: 10,
              paddingTop: 6, paddingBottom: 6,
              fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb", color: "#374151", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 24 }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 24 }}>No subjects found</p>
        ) : (
          filtered.map((s) => <SubjectCard key={s.id} subject={s} />)
        )}
      </div>

      <div style={{ padding: "10px 16px", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 6 }}>
        <p style={{ fontSize: 10, color: "#9ca3af" }}>Drag cards into the grid</p>
      </div>
    </div>
  )
}