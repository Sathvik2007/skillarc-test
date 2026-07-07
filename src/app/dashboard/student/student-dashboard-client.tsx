"use client"

import Link from "next/link"
import { Activity, AlertCircle, BookOpen, CalendarDays, CheckCircle2, ChevronRight, Clock, GraduationCap } from "lucide-react"

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
      accent: "bg-emerald-100 text-emerald-700",
      icon: <Activity size={18} className="text-emerald-700" />,
    },
    {
      label: "Courses enrolled",
      value: subjects.length,
      sublabel: "Live subject list",
      accent: "bg-violet-100 text-violet-700",
      icon: <BookOpen size={18} className="text-violet-700" />,
    },
    {
      label: "Today’s classes",
      value: schedule.length,
      sublabel: "From your section timetable",
      accent: "bg-sky-100 text-sky-700",
      icon: <CalendarDays size={18} className="text-sky-700" />,
    },
    {
      label: "Section",
      value: student.sectionName || "—",
      sublabel: student.programName || "Program pending",
      accent: "bg-amber-100 text-amber-700",
      icon: <GraduationCap size={18} className="text-amber-700" />,
    },
  ]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200/30">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Student dashboard</p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">Welcome back, {student.name}</h1>
              <p className="mt-2 text-sm text-slate-500">{student.institution} · {student.programName} · Semester {student.semester ?? "—"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/student/todo" className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100">
              📋 To-Do List
            </Link>
            <Link href="/dashboard/student/report-card" className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
              🏆 Report Card
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${item.accent}`}>
              {item.icon}
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-950">{item.value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{item.label}</p>
            <p className="mt-2 text-sm text-slate-500">{item.sublabel}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4 pb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Today’s classes</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">Your schedule</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Live</span>
          </div>
          <div className="space-y-4">
            {schedule.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No class sessions are scheduled for today yet.</div>
            ) : (
              schedule.map((item) => (
                <div key={`${item.day}-${item.period}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.subjectCode} · {item.subjectName}</p>
                      <p className="mt-2 text-sm text-slate-500">Faculty: {item.facultyName}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                      <Clock size={14} /> Period {item.period}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="space-y-6 rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Attendance</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950">Session summary</h2>
          </div>
          <div className="grid gap-3">
            <div className="rounded-3xl bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Present</p>
              <p className="mt-3 text-3xl font-bold text-emerald-900">{attendance.present}</p>
            </div>
            <div className="rounded-3xl bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">Absent</p>
              <p className="mt-3 text-3xl font-bold text-rose-900">{attendance.absent}</p>
            </div>
            <div className="rounded-3xl bg-sky-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Late</p>
              <p className="mt-3 text-3xl font-bold text-sky-900">{attendance.late}</p>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Student details</p>
            <div className="mt-4 grid gap-3">
              {[
                ["Email", student.email],
                ["Registration", student.registrationNumber],
                ["Phone", student.phone],
                ["Admission year", student.admissionYear ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl bg-white p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
