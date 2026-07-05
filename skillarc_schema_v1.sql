-- =============================================================
-- SkillArc Database Schema v1.0
-- Date: 2026-06-12
--
-- Instructions:
-- 1. Create a new Supabase project.
-- 2. Open SQL Editor.
-- 3. Run this file.
-- 4. Do not modify existing tables or columns.
-- 5. Discuss schema changes before implementation.
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- -------------------------------------------------------------
-- CORE: Organizations, Institutions, Departments, Programs
-- -------------------------------------------------------------

CREATE TABLE public.organizations (
  id           uuid NOT NULL DEFAULT uuid_generate_v4(),
  name         text NOT NULL,
  created_at   timestamp DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

CREATE TABLE public.institutions (
  id              uuid NOT NULL DEFAULT uuid_generate_v4(),
  name            text,
  domain          text,
  organization_id uuid,
  CONSTRAINT institutions_pkey PRIMARY KEY (id),
  CONSTRAINT institutions_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);

CREATE TABLE public.departments (
  id             uuid NOT NULL DEFAULT uuid_generate_v4(),
  institution_id uuid,
  name           text,
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_institution_id_fkey
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);

CREATE TABLE public.programs (
  id              uuid NOT NULL DEFAULT uuid_generate_v4(),
  name            text NOT NULL,
  department_id   uuid,
  institution_id  uuid,
  organization_id uuid,
  CONSTRAINT programs_pkey PRIMARY KEY (id),
  CONSTRAINT programs_department_id_fkey
    FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT programs_institution_id_fkey
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT programs_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);


-- -------------------------------------------------------------
-- USERS & ACCESS
-- -------------------------------------------------------------

-- NOTE: sections references users (faculty_advisor_id), and users references
-- sections (section_id) — create users first without the FK, then add it after sections.

CREATE TABLE public.users (
  id                  uuid NOT NULL,
  institution_id      uuid,
  department_id       uuid,
  name                text,
  email               text UNIQUE,
  role                text CHECK (role = ANY (ARRAY[
                        'SUPER_ADMIN','ORG_ADMIN','INSTITUTION_ADMIN',
                        'HOD','PROGRAM_HEAD','FACULTY','STUDENT','PARENT'
                      ])),
  program_id          uuid,
  organization_id     uuid,
  section_id          uuid,   -- FK added after sections table
  semester            integer,
  created_at          timestamp DEFAULT now(),
  updated_at          timestamp DEFAULT now(),
  phone               text,
  is_active           boolean DEFAULT true,
  profile_image_url   text,
  registration_number text UNIQUE,
  admission_year      integer,
  dob                 date,
  gender              text,
  employee_id         text UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_institution_id_fkey
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT users_department_id_fkey
    FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT users_program_id_fkey
    FOREIGN KEY (program_id) REFERENCES public.programs(id),
  CONSTRAINT users_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);

CREATE TABLE public.sections (
  id                uuid NOT NULL DEFAULT uuid_generate_v4(),
  name              text NOT NULL,
  semester          integer NOT NULL,
  program_id        uuid,
  institution_id    uuid,
  faculty_advisor_id uuid,
  CONSTRAINT sections_pkey PRIMARY KEY (id),
  CONSTRAINT sections_program_id_fkey
    FOREIGN KEY (program_id) REFERENCES public.programs(id),
  CONSTRAINT sections_institution_id_fkey
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT sections_faculty_advisor_id_fkey
    FOREIGN KEY (faculty_advisor_id) REFERENCES public.users(id)
);

-- Resolve circular FK: users.section_id → sections
ALTER TABLE public.users
  ADD CONSTRAINT users_section_id_fkey
  FOREIGN KEY (section_id) REFERENCES public.sections(id);

CREATE TABLE public.parent_student_relations (
  id           uuid NOT NULL DEFAULT uuid_generate_v4(),
  parent_id    uuid,
  student_id   uuid,
  relationship text,
  CONSTRAINT parent_student_relations_pkey PRIMARY KEY (id),
  CONSTRAINT parent_student_relations_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES public.users(id),
  CONSTRAINT parent_student_relations_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.users(id)
);

CREATE TABLE public.permissions (
  id   uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  CONSTRAINT permissions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.user_permissions (
  id            uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id       uuid,
  permission_id uuid,
  CONSTRAINT user_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT user_permissions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_permissions_permission_id_fkey
    FOREIGN KEY (permission_id) REFERENCES public.permissions(id)
);


-- -------------------------------------------------------------
-- ACADEMIC: Subjects, Timetable, Periods
-- -------------------------------------------------------------

CREATE TABLE public.subjects (
  id             uuid NOT NULL DEFAULT uuid_generate_v4(),
  institution_id uuid,
  name           text,
  code           text,
  semester       integer,
  faculty_id     uuid,
  section_id     uuid,
  program_id     uuid,
  credits        integer,
  subject_type   text CHECK (subject_type = ANY (ARRAY['THEORY','LAB','ELECTIVE'])),
  CONSTRAINT subjects_pkey PRIMARY KEY (id),
  CONSTRAINT subjects_institution_id_fkey
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT subjects_teacher_id_fkey
    FOREIGN KEY (faculty_id) REFERENCES public.users(id),
  CONSTRAINT subjects_section_id_fkey
    FOREIGN KEY (section_id) REFERENCES public.sections(id),
  CONSTRAINT subjects_program_id_fkey
    FOREIGN KEY (program_id) REFERENCES public.programs(id)
);

CREATE TABLE public.timetable_slots (
  id              uuid NOT NULL DEFAULT uuid_generate_v4(),
  institution_id  uuid,
  day             text,
  period          integer,
  subject_id      uuid,
  faculty_id      uuid,
  semester        integer,
  organization_id uuid,
  section_id      uuid,
  CONSTRAINT timetable_slots_pkey PRIMARY KEY (id),
  CONSTRAINT timetable_slots_institution_id_fkey
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT timetable_slots_subject_id_fkey
    FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT timetable_slots_teacher_id_fkey
    FOREIGN KEY (faculty_id) REFERENCES public.users(id),
  CONSTRAINT timetable_slots_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT timetable_slots_section_id_fkey
    FOREIGN KEY (section_id) REFERENCES public.sections(id)
);

CREATE TABLE public.periods (
  id             uuid NOT NULL DEFAULT uuid_generate_v4(),
  institution_id uuid,
  period_number  integer NOT NULL,
  start_time     time NOT NULL,
  end_time       time NOT NULL,
  CONSTRAINT periods_pkey PRIMARY KEY (id),
  CONSTRAINT periods_institution_id_fkey
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);

CREATE TABLE public.subject_allocations (
  id         uuid NOT NULL DEFAULT uuid_generate_v4(),
  subject_id uuid,
  faculty_id uuid,
  section_id uuid,
  created_at timestamp DEFAULT now(),
  CONSTRAINT subject_allocations_pkey PRIMARY KEY (id),
  CONSTRAINT subject_allocations_subject_id_fkey
    FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT subject_allocations_faculty_id_fkey
    FOREIGN KEY (faculty_id) REFERENCES public.users(id),
  CONSTRAINT subject_allocations_section_id_fkey
    FOREIGN KEY (section_id) REFERENCES public.sections(id)
);


-- -------------------------------------------------------------
-- ATTENDANCE
-- -------------------------------------------------------------

CREATE TABLE public.attendance_sessions (
  id              uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id      uuid,
  faculty_id      uuid,
  section_id      uuid,
  attendance_date date NOT NULL,
  period          integer NOT NULL,
  CONSTRAINT attendance_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_sessions_subject_id_fkey
    FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT attendance_sessions_faculty_id_fkey
    FOREIGN KEY (faculty_id) REFERENCES public.users(id),
  CONSTRAINT attendance_sessions_section_id_fkey
    FOREIGN KEY (section_id) REFERENCES public.sections(id)
);

CREATE TABLE public.attendance_records (
  id         uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid,
  student_id uuid,
  status     text NOT NULL CHECK (status = ANY (ARRAY['PRESENT','ABSENT','LATE'])),
  CONSTRAINT attendance_records_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_records_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES public.attendance_sessions(id),
  CONSTRAINT attendance_records_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.users(id)
);


-- -------------------------------------------------------------
-- ASSIGNMENTS & SUBMISSIONS
-- -------------------------------------------------------------

CREATE TABLE public.assignments (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id  uuid,
  faculty_id  uuid,
  title       text NOT NULL,
  description text,
  due_date    timestamp,
  created_at  timestamp DEFAULT now(),
  updated_at  timestamp DEFAULT now(),
  CONSTRAINT assignments_pkey PRIMARY KEY (id),
  CONSTRAINT assignments_subject_id_fkey
    FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT assignments_faculty_id_fkey
    FOREIGN KEY (faculty_id) REFERENCES public.users(id)
);

CREATE TABLE public.submissions (
  id            uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid,
  student_id    uuid,
  file_url      text,
  submitted_at  timestamp DEFAULT now(),
  grade         numeric,
  feedback      text,
  CONSTRAINT submissions_pkey PRIMARY KEY (id),
  CONSTRAINT submissions_assignment_id_fkey
    FOREIGN KEY (assignment_id) REFERENCES public.assignments(id),
  CONSTRAINT submissions_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.users(id)
);


-- -------------------------------------------------------------
-- RESOURCES & ONLINE SESSIONS
-- -------------------------------------------------------------

CREATE TABLE public.resources (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id  uuid,
  faculty_id  uuid,
  title       text NOT NULL,
  file_url    text NOT NULL,
  uploaded_at timestamp DEFAULT now(),
  CONSTRAINT resources_pkey PRIMARY KEY (id),
  CONSTRAINT resources_subject_id_fkey
    FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT resources_faculty_id_fkey
    FOREIGN KEY (faculty_id) REFERENCES public.users(id)
);

CREATE TABLE public.online_sessions (
  id             uuid NOT NULL DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  description    text,
  host_id        uuid,
  institution_id uuid,
  session_link   text NOT NULL,
  start_time     timestamp NOT NULL,
  end_time       timestamp,
  created_at     timestamp DEFAULT now(),
  CONSTRAINT online_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT online_sessions_host_id_fkey
    FOREIGN KEY (host_id) REFERENCES public.users(id),
  CONSTRAINT online_sessions_institution_id_fkey
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);

CREATE TABLE public.online_session_participants (
  id         uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid,
  user_id    uuid,
  joined_at  timestamp,
  left_at    timestamp,
  CONSTRAINT online_session_participants_pkey PRIMARY KEY (id),
  CONSTRAINT online_session_participants_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES public.online_sessions(id),
  CONSTRAINT online_session_participants_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);


-- -------------------------------------------------------------
-- PROJECTS
-- -------------------------------------------------------------

CREATE TABLE public.projects (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  faculty_id  uuid,
  created_at  timestamp DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_faculty_id_fkey
    FOREIGN KEY (faculty_id) REFERENCES public.users(id)
);

CREATE TABLE public.project_groups (
  id         uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  group_name text NOT NULL,
  CONSTRAINT project_groups_pkey PRIMARY KEY (id),
  CONSTRAINT project_groups_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES public.projects(id)
);

CREATE TABLE public.group_members (
  id         uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id   uuid,
  student_id uuid,
  CONSTRAINT group_members_pkey PRIMARY KEY (id),
  CONSTRAINT group_members_group_id_fkey
    FOREIGN KEY (group_id) REFERENCES public.project_groups(id),
  CONSTRAINT group_members_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.users(id)
);


-- -------------------------------------------------------------
-- EVENTS & ANNOUNCEMENTS
-- -------------------------------------------------------------

CREATE TABLE public.events (
  id             uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid,
  title          text NOT NULL,
  description    text,
  event_date     timestamp,
  venue          text,
  created_by     uuid,
  created_at     timestamp DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_institution_id_fkey
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT events_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.users(id)
);

CREATE TABLE public.event_registrations (
  id            uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id      uuid,
  user_id       uuid,
  registered_at timestamp DEFAULT now(),
  CONSTRAINT event_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT event_registrations_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_registrations_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.announcements (
  id             uuid NOT NULL DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  content        text NOT NULL,
  created_by     uuid,
  institution_id uuid,
  created_at     timestamp DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id),
  CONSTRAINT announcements_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT announcements_institution_id_fkey
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);


-- -------------------------------------------------------------
-- PLACEMENTS
-- -------------------------------------------------------------

CREATE TABLE public.companies (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  website     text,
  description text,
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);

CREATE TABLE public.job_posts (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id  uuid,
  title       text NOT NULL,
  description text,
  deadline    date,
  CONSTRAINT job_posts_pkey PRIMARY KEY (id),
  CONSTRAINT job_posts_company_id_fkey
    FOREIGN KEY (company_id) REFERENCES public.companies(id)
);

CREATE TABLE public.applications (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  job_post_id uuid,
  student_id  uuid,
  status      text DEFAULT 'APPLIED',
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_job_post_id_fkey
    FOREIGN KEY (job_post_id) REFERENCES public.job_posts(id),
  CONSTRAINT applications_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.users(id)
);


-- -------------------------------------------------------------
-- COMPLAINTS, NOTIFICATIONS, AUDIT
-- -------------------------------------------------------------

CREATE TABLE public.complaints (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id  uuid,
  title       text NOT NULL,
  description text,
  status      text DEFAULT 'OPEN' CHECK (status = ANY (ARRAY['OPEN','IN_PROGRESS','RESOLVED','CLOSED'])),
  created_at  timestamp DEFAULT now(),
  CONSTRAINT complaints_pkey PRIMARY KEY (id),
  CONSTRAINT complaints_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.users(id)
);

CREATE TABLE public.notifications (
  id         uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id    uuid,
  title      text NOT NULL,
  message    text NOT NULL,
  is_read    boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.audit_logs (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id     uuid,
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamp DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);
create table public.leave_applications (
  id uuid not null default gen_random_uuid (),
  student_id uuid not null,
  section_id uuid null,
  advisor_id uuid null,
  status text not null default 'PENDING'::text,
  reason text null,
  notes text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  institution_id uuid null,
  from_date date not null,
  to_date date not null,
  approved_at timestamp without time zone null,
  approved_by uuid null,
  constraint leave_applications_pkey primary key (id),
  constraint leave_applications_approved_by_fkey foreign KEY (approved_by) references users (id),
  constraint leave_applications_institution_id_fkey foreign KEY (institution_id) references institutions (id),
  constraint leave_applications_advisor_id_fkey foreign KEY (advisor_id) references users (id),
  constraint leave_applications_section_id_fkey foreign KEY (section_id) references sections (id),
  constraint leave_applications_student_id_fkey foreign KEY (student_id) references users (id),
  constraint leave_applications_status_check check (
    (
      status = any (
        array[
          'PENDING'::text,
          'APPROVED'::text,
          'REJECTED'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


-- ===========================================
-- MEETINGS
-- ===========================================

CREATE TABLE public.meetings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    institution_id uuid NOT NULL
        REFERENCES public.institutions(id) ON DELETE CASCADE,

    timetable_slot_id uuid
        REFERENCES public.timetable_slots(id) ON DELETE SET NULL,

    subject_id uuid
        REFERENCES public.subjects(id) ON DELETE CASCADE,

    section_id uuid
        REFERENCES public.sections(id) ON DELETE CASCADE,

    faculty_id uuid NOT NULL
        REFERENCES public.users(id) ON DELETE CASCADE,

    meeting_code text UNIQUE NOT NULL,

    title text NOT NULL,

    meeting_provider text NOT NULL DEFAULT 'daily'
        CHECK (meeting_provider IN ('daily','livekit','jitsi','zoom')),

    meeting_type text NOT NULL DEFAULT 'instant'
        CHECK (meeting_type IN ('instant','scheduled')),

    meeting_url text,

    is_active boolean DEFAULT true,

    scheduled_start timestamptz,
    scheduled_end timestamptz,

    started_at timestamptz,
    ended_at timestamptz,

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);



-- ===========================================
-- MEETING PARTICIPANTS
-- ===========================================

CREATE TABLE public.meeting_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    meeting_id uuid NOT NULL
        REFERENCES public.meetings(id) ON DELETE CASCADE,

    user_id uuid NOT NULL
        REFERENCES public.users(id) ON DELETE CASCADE,

    joined_at timestamptz DEFAULT now(),

    left_at timestamptz,

    is_present boolean DEFAULT true,

    UNIQUE(meeting_id, user_id)
);



-- ===========================================
-- MEETING MESSAGES
-- ===========================================

CREATE TABLE public.meeting_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    meeting_id uuid NOT NULL
        REFERENCES public.meetings(id) ON DELETE CASCADE,

    institution_id uuid NOT NULL
        REFERENCES public.institutions(id) ON DELETE CASCADE,

    sender_id uuid NOT NULL
        REFERENCES public.users(id) ON DELETE CASCADE,

    sender_name text NOT NULL,

    message text NOT NULL,

    is_deleted boolean DEFAULT false,

    created_at timestamptz DEFAULT now()
);



-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_meetings_faculty
ON public.meetings(faculty_id);

CREATE INDEX idx_meetings_section
ON public.meetings(section_id);

CREATE INDEX idx_meetings_subject
ON public.meetings(subject_id);

CREATE INDEX idx_meetings_slot
ON public.meetings(timetable_slot_id);

CREATE INDEX idx_participants_meeting
ON public.meeting_participants(meeting_id);

CREATE INDEX idx_participants_user
ON public.meeting_participants(user_id);

CREATE INDEX idx_messages_meeting
ON public.meeting_messages(meeting_id);



-- ===========================================
-- ENABLE RLS
-- ===========================================

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_messages ENABLE ROW LEVEL SECURITY;



-- ===========================================
-- TEMP DEVELOPMENT POLICIES
-- (Replace later with proper policies)
-- ===========================================

CREATE POLICY "meetings_all"
ON public.meetings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "participants_all"
ON public.meeting_participants
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "messages_all"
ON public.meeting_messages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
-- =============================================================
--  END OF SCHEMA  (30 tables total)
-- =============================================================