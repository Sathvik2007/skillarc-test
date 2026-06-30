// types/index.ts  — single source of truth for all domain types

// ── Auth ──────────────────────────────────────────────────────────────────────
export type Role = "Official" | "Admin" | "Student";

export interface AuthUser {
  id: string;
  username: string;
  role: Role;
  company?: string;       // Admin only
  student_id?: string;    // Student only
}

export interface LoginPayload {
  username: string;
  password: string;
  login_type: "Official (Placement Cell)" | "Student" | "Company Admin";
}

// ── Student ───────────────────────────────────────────────────────────────────
export interface Student {
  student_id: string;
  name: string;
  branch: string;
  year: number;
  skills: string;         // comma-separated
  hackathons: number;
  papers: number;
  conferences: number;
  sports: number;
  clubs: number;
  status: "Placed" | "Not Placed" | "Rejected";
  company?: string;
  package?: number;       // LPA
  placed_date?: string;
  sgpa: Record<`sem${1|2|3|4|5|6|7|8}`, number>;
  backlogs: Record<`sem${1|2|3|4|5|6|7|8}`, number>;
  attendance: Record<`sem${1|2|3|4|5|6|7|8}`, number>;
}

// ── Company ───────────────────────────────────────────────────────────────────
export interface Company {
  id: string;
  name: string;
  website?: string;
  location?: string;
  industry: string;
  contact_person?: string;
  email?: string;
  phone?: string;
}

// ── Drive ─────────────────────────────────────────────────────────────────────
export interface Drive {
  id: string;
  company_id: string;
  company_name: string;
  job_title: string;
  job_type: "Full Time" | "Internship" | "Internship + PPO";
  ctc: number;
  vacancies: number;
  eligible_branches: string[];
  min_cgpa: number;
  backlogs_allowed: number;
  skills_required: string;
  rounds: string[];
  interview_mode: "Online" | "Offline";
  ppt_date?: string;
  test_date?: string;
  interview_date?: string;
  offer_date?: string;
  joining_date?: string;
  drive_status: "Upcoming" | "Ongoing" | "Completed";
  applied: number;
  shortlisted: number;
  selected: number;
  created_at: string;
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface KPIData {
  total_students: number;
  placed_students: number;
  companies: number;
  avg_package: number;
  placement_rate: number;
}

export interface YearlyTrend {
  year: number;
  placements: number;
  placement_rate: number;
  avg_package: number;
}

export interface BranchStat {
  branch: string;
  placements: number;
  total: number;
  rate: number;
}

export interface CompanyStat {
  company: string;
  applicants: number;
  selected: number;
  avg_package: number;
  selection_rate: number;
}

// ── API response wrapper ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
