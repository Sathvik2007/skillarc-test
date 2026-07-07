"use client"

import Hero from "@/modules/faculty-dashboard/components/Hero"
import Stats from "@/modules/faculty-dashboard/components/Stats"
import TodaySchedule from "@/modules/faculty-dashboard/components/TodaySchedule"
import QuickActions from "@/modules/faculty-dashboard/components/QuickActions"
import SubjectGrid from "@/modules/faculty-dashboard/components/SubjectGrid"
import RecentActivity from "@/modules/faculty-dashboard/components/RecentActivity"

interface Subject { id: string; name: string; code: string }
interface TimetableSlot {
  day: string
  period: number
  section_id: string
  subjects: { id: string; name: string; code: string } | null | undefined
  sections: { name: string } | null | undefined
}

const PERIOD_LABELS: Record<number, string> = {
  1: "8:45 – 9:45",
  2: "9:45 – 10:45",
  3: "11:00 – 12:00",
  4: "12:00 – 1:00",
  5: "2:00 – 3:00",
}

export default function FacultyDashboardClient({
  faculty,
  subjects,
  studentCount,
  timetableSlots,
}: {
  faculty: {
    name?: string
    email: string
    institution: string
  }
  subjects: Subject[]
  studentCount: number
  timetableSlots: TimetableSlot[]
}) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
  const todaySchedule = timetableSlots
    .filter((slot) => slot.day === today)
    .map((slot) => ({
      id: `${slot.day}-${slot.period}-${slot.section_id}`,
      subject: slot.subjects?.code ?? slot.subjects?.name ?? "Class",
      section: slot.sections?.name ?? "Section",
      room: slot.sections?.name ? `Room ${slot.sections.name}` : "Main Hall",
      time: `Period ${slot.period} · ${PERIOD_LABELS[slot.period] ?? "TBD"}`,
    }))

  const weeklyClasses = timetableSlots.length
  const uniqueSubjectCount = new Set(subjects.map((subject) => subject.id)).size

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200/30">
                <span className="text-2xl">👩‍🏫</span>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Faculty dashboard</p>
                <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">Welcome back, {faculty.name ?? "Faculty"}</h1>
                <p className="mt-2 text-sm text-slate-500">{faculty.institution} · {faculty.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100">
                Preview schedule
              </button>
              <button className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Create attendance
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-4">
          <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
              <span className="text-lg">📈</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-950">{attendanceInfo(timetableSlots.length, "classes")}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Weekly classes</p>
            <p className="mt-2 text-sm text-slate-500">Your teaching commitments this week</p>
          </div>
          <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-100 text-violet-700">
              <span className="text-lg">📚</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-950">{uniqueSubjectCount}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Subjects assigned</p>
            <p className="mt-2 text-sm text-slate-500">Active teaching subjects in your roster</p>
          </div>
          <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
              <span className="text-lg">👥</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-950">{studentCount}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Students supported</p>
            <p className="mt-2 text-sm text-slate-500">Total learners in your institution</p>
          </div>
          <div className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
              <span className="text-lg">🧭</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-950">{today}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Today’s view</p>
            <p className="mt-2 text-sm text-slate-500">A quick snapshot of today’s schedule</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Today’s schedule</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">Your teaching plan</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Live</span>
            </div>
            <div className="space-y-4">
              {todaySchedule.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No classes scheduled for today.
                </div>
              ) : (
                todaySchedule.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.subject}</p>
                        <p className="mt-2 text-sm text-slate-500">{item.section}</p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="space-y-6 rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Quick actions</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">Focus tools</h2>
            </div>
            <div className="grid gap-4">
              <button className="w-full rounded-3xl border border-indigo-200 bg-indigo-50 px-4 py-4 text-left text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100">
                Review attendance records
              </button>
              <button className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Update your timetable
              </button>
              <button className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Share resources with students
              </button>
            </div>
          </aside>
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Subject roster</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">Courses you’re teaching</h2>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              {subjects.length} subjects assigned
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {subjects.map((subject) => (
              <div key={subject.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">{subject.name}</p>
                <p className="mt-2 text-sm text-slate-500">Code: {subject.code}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4 pb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Recent activity</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">What’s happening</h2>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              {
                id: "1",
                title: "Attendance Submitted",
                description: "WT - Section A",
                time: "10 min ago",
              },
              {
                id: "2",
                title: "Timetable Updated",
                description: "Weekly schedule refreshed",
                time: "2 hrs ago",
              },
              {
                id: "3",
                title: "Subject Assigned",
                description: "Database Management Systems",
                time: "Yesterday",
              },
            ].map((activity) => (
              <div key={activity.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{activity.description}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function attendanceInfo(value: number, label: string) {
  return `${value} ${label}`
}
