import { BookOpen, CalendarDays, Clock3, GraduationCap, Users } from "lucide-react"

interface Props {
  programs: any[]
  sections: any[]
  subjects: any[]

  selectedProgram: string
  selectedSemester: string
  selectedSection: string
  selectedSubject: string
  selectedPeriod: string
  selectedDate: string

  setSelectedProgram: (v: string) => void
  setSelectedSemester: (v: string) => void
  setSelectedSection: (v: string) => void
  setSelectedSubject: (v: string) => void
  setSelectedPeriod: (v: string) => void
  setSelectedDate: (v: string) => void
}

export default function AttendanceFilters({
  programs,
  sections,
  subjects,

  selectedProgram,
  selectedSemester,
  selectedSection,
  selectedSubject,
  selectedPeriod,
  selectedDate,

  setSelectedProgram,
  setSelectedSemester,
  setSelectedSection,
  setSelectedSubject,
  setSelectedPeriod,
  setSelectedDate,
}: Props) {
  const filteredSections = sections.filter((s: any) => {
    if (!selectedSemester) return false

    return (
      String(s.semester) === selectedSemester &&
      (!selectedProgram || s.program_id === selectedProgram)
    )
  })

  const filteredSubjects = subjects.filter((s: any) => {
    if (!selectedSemester) return false

    return String(s.semester) === selectedSemester
  })

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Class setup</h2>
        <p className="mt-1 text-sm text-slate-500">Choose the class details before marking attendance.</p>
      </div>

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <GraduationCap size={16} /> Program
          </span>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="">All programs</option>
            {programs.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Users size={16} /> Semester
          </span>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="">Select semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={String(sem)}>
                Semester {sem}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Users size={16} /> Section
          </span>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="">Select section</option>
            {filteredSections.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <BookOpen size={16} /> Subject
          </span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="">Select subject</option>
            {filteredSubjects.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.code} • {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Clock3 size={16} /> Period
          </span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="">Select period</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
              <option key={p} value={String(p)}>
                Period {p}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <CalendarDays size={16} /> Date
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </label>
      </div>
    </div>
  )
}