"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Award, UserCheck, Mail, Calendar, ChevronRight } from "lucide-react"
import { ROLES } from "@/constants/roles"

interface Subject {
  id: string
  name: string
  code: string
  facultyName: string
}

export default function ParentDashboardClient({
  parent,
  subjects,
}: {
  parent: { name: string; email: string; institution: string }
  subjects: Subject[]
}) {
  const router = useRouter()

  const [childInfo] = useState({
    name: "Alex Doe",
    grade: "Grade 10 - Batch A",
    attendance: 94,
    cgpa: "A (3.82)",
    weeklySchedule: [
      { period: "P1", time: "09:00 - 10:00", code: "DAA", subject: "Design & Analysis of Algorithms", faculty: "Dr. Grace Hopper" },
      { period: "P2", time: "10:15 - 11:15", code: "DCN", subject: "Data Communication & Networking", faculty: "Dr. Grace Hopper" },
      { period: "P3", time: "11:30 - 12:30", code: "WT", subject: "Web Technologies", faculty: "Prof. Richard Feynman" },
      { period: "P4", time: "14:00 - 15:00", code: "TOC", subject: "Theory of Computation", faculty: "Dr. Alan Turing" },
    ],
  })

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200/30">
                <span className="text-2xl">👨‍👩‍👧</span>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Parent overview</p>
                <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">Hi, {parent.name}</h1>
                <p className="mt-2 text-sm text-slate-500">{parent.institution} · {parent.email}</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/parent")}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/30 transition hover:bg-indigo-700"
            >
              <Mail size={16} /> Message advisor
            </button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
              <UserCheck size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-950">{childInfo.attendance}%</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Attendance</p>
            <p className="mt-2 text-sm text-slate-500">Current attendance for {childInfo.name}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-100 text-violet-700">
              <Award size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-950">{childInfo.cgpa}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Academic grade</p>
            <p className="mt-2 text-sm text-slate-500">Latest cumulative point average</p>
          </div>
          <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
              <BookOpen size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-950">{subjects.length}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Courses</p>
            <p className="mt-2 text-sm text-slate-500">Enrolled subjects for the current term</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Weekly schedule</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">Today’s timetable</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{childInfo.grade}</span>
            </div>
            <div className="space-y-4">
              {childInfo.weeklySchedule.map((session) => (
                <div key={session.period} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{session.code} · {session.subject}</p>
                      <p className="mt-2 text-sm text-slate-500">{session.faculty}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                      <Calendar size={14} /> {session.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Preferred academic focus</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">Course overview</h2>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 transition hover:bg-indigo-100">
                View child report
              </button>
            </div>
            <div className="grid gap-4">
              {subjects.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No subjects are assigned yet.
                </div>
              ) : (
                subjects.map((subject) => (
                  <div key={subject.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{subject.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{subject.code}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-3 text-sm text-slate-500">Faculty: {subject.facultyName}</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
