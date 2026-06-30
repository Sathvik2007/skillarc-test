import { supabase } from "@/lib/supabase"
import { ROLES } from "@/constants/roles"

export const timetableService = {
  async getCurrentInstitutionId() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("User not authenticated")
    }

    const { data: profile, error } = await supabase
      .from("users")
      .select("institution_id")
      .eq("id", user.id)
      .single()

    if (error) throw error

    return profile.institution_id
  },

  async getSubjects(institutionId: string, semester?: number, programId?: string | null) {
    let query = supabase
      .from("subjects")
      .select(`
        id,
        name,
        code,
        semester,
        institution_id,
        program_id,
        credits,
        subject_type
      `)
      .eq("institution_id", institutionId)

    if (semester) {
      query = query.eq("semester", semester)
    }

    if (programId) {
      query = query.eq("program_id", programId)
    }

    const { data, error } = await query

    if (error) throw error

    return data ?? []
  },

  async getFaculty(institutionId: string, programId?: string | null) {
    const { data: subjectData, error: subjectError } = await supabase
      .from("subjects")
      .select("id")
      .eq("institution_id", institutionId)
      .eq("program_id", programId)

    if (subjectError) throw subjectError

    const subjectIds = (subjectData ?? []).map((subject) => subject.id)

    if (subjectIds.length === 0) return []

    const { data, error } = await supabase
      .from("faculty_subjects")
      .select("faculty:faculty_id(id, name, email, role)")
      .in("subject_id", subjectIds)

    if (error) throw error

    const seen = new Set<string>()

    return (data ?? [])
      .map((row: any) => row.faculty)
      .filter(Boolean)
      .filter((faculty: any) => {
        if (seen.has(faculty.id)) return false
        seen.add(faculty.id)
        return true
      })
  },

  async getSlots(institutionId: string, sectionId: string, semester: number) {
    const { data, error } = await supabase
      .from("timetable_slots")
      .select(`
        day,
        period,
        subject_id,
        faculty_id,
        faculty:faculty_id(id, name),
        subjects(
          id,
          name,
          code,
          semester,
          institution_id,
          program_id,
          credits,
          subject_type
        )
      `)
      .eq("institution_id", institutionId)
      .eq("section_id", sectionId)
      .eq("semester", semester)

    if (error) throw error

    return (data ?? []).map((s: any) => ({
      day: s.day,
      period: `P${s.period}`,
      faculty_id: s.faculty_id ?? null,
      faculty_name: s.faculty?.name ?? null,
      subject: {
        ...s.subjects,
        faculty_name: s.faculty?.name ?? null,
      },
    }))
  },

  async saveSlot({
    institutionId,
    sectionId,
    semester,
    day,
    period,
    subjectId,
    facultyId,
  }: {
    institutionId: string
    sectionId: string
    semester: number
    day: string
    period: number
    subjectId: string
    facultyId?: string | null
  }) {
    const { error } = await supabase
      .from("timetable_slots")
      .upsert(
        {
          institution_id: institutionId,
          section_id: sectionId,
          semester,
          day,
          period,
          subject_id: subjectId,
          faculty_id: facultyId ?? null,
        },
        {
          onConflict: "institution_id,section_id,semester,day,period",
        }
      )

    if (error) throw error
  },
}