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

  const recentActivities = [
    {
      id: "1",
      title: "Attendance Submitted",
      description: "WT - Section A",
      time: "10 min ago",
      type: "attendance" as const,
    },
    {
      id: "2",
      title: "Timetable Updated",
      description: "Weekly schedule refreshed",
      time: "2 hrs ago",
      type: "timetable" as const,
    },
    {
      id: "3",
      title: "Subject Assigned",
      description: "Database Management Systems",
      time: "Yesterday",
      type: "subject" as const,
    },
  ]

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <Hero
        faculty={faculty}
        subjectCount={uniqueSubjectCount}
        todayClasses={todaySchedule.length}
      />

      <Stats
        subjectCount={uniqueSubjectCount}
        studentCount={studentCount}
        todayClasses={todaySchedule.length}
        weeklyClasses={weeklyClasses}
      />

      <TodaySchedule schedule={todaySchedule} />

      <QuickActions />

      <SubjectGrid subjects={subjects} />

      <RecentActivity activities={recentActivities} />
    </div>
  )
}