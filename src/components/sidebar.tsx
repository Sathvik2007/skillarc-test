"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Layers,
  UserCog,
  School,
  ClipboardList,
  BarChart3,
  User,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ROLES } from "@/constants/roles"
type Role = typeof ROLES[keyof typeof ROLES]

type MenuItem = {
  name: string
  icon: React.ElementType
  path: string
  badge?: number | null
}

const roleMenus: Record<Role, MenuItem[]> = {
  [ROLES.SUPER_ADMIN]: [
    { name: "Overview",       icon: LayoutDashboard, path: "/dashboard/super-admin" },
    { name: "Organizations",  icon: Building2,        path: "/dashboard/super-admin/organizations" },
    { name: "Org Admins",     icon: UserCog,          path: "/dashboard/super-admin/org-admins" },
    { name: "Institutions",   icon: School,           path: "/dashboard/super-admin/institutions" },
    { name: "Analytics",      icon: BarChart3,        path: "/dashboard/super-admin/analytics" },
    { name: "Audit Logs",     icon: ClipboardList,    path: "/dashboard/super-admin/audit-logs" },
    { name: "Settings",       icon: Settings,         path: "/dashboard/super-admin/settings" },
  ],

  [ROLES.ORG_ADMIN]: [
    { name: "Overview",          icon: LayoutDashboard, path: "/dashboard/org-admin" },
    { name: "Institutions",      icon: School,          path: "/dashboard/org-admin/institutions" },
    { name: "Institution Admins",icon: UserCog,         path: "/dashboard/org-admin/admins" },
    { name: "Analytics",         icon: BarChart3,       path: "/dashboard/org-admin/analytics" },
    { name: "Settings",          icon: Settings,        path: "/dashboard/org-admin/settings" },
  ],

  [ROLES.INSTITUTION_ADMIN]: [
    { name: "Overview",     icon: LayoutDashboard, path: "/dashboard/institution-admin" },
    { name: "Departments",  icon: Layers,           path: "/dashboard/institution-admin/departments" },
    { name: "Programs",     icon: ClipboardList,    path: "/dashboard/institution-admin/programs" },
    { name: "Sections",     icon: BookOpen,         path: "/dashboard/institution-admin/sections" },
    { name: "Faculty",      icon: GraduationCap,    path: "/dashboard/institution-admin/faculty" },
    { name: "Students",     icon: Users,            path: "/dashboard/institution-admin/students" },
    { name: "Subjects",     icon: BookOpen,         path: "/dashboard/institution-admin/subjects" },
    { name: "Timetable",    icon: Calendar,         path: "/dashboard/institution-admin/timetable" },
    { name: "Settings",     icon: Settings,         path: "/dashboard/institution-admin/settings" },
  ],

  [ROLES.HOD]: [
    { name: "Overview",    icon: LayoutDashboard, path: "/dashboard/hod" },
    { name: "Programs",    icon: ClipboardList,    path: "/dashboard/hod/programs" },
    { name: "Faculty",     icon: GraduationCap,    path: "/dashboard/hod/faculty" },
    { name: "Students",    icon: Users,            path: "/dashboard/hod/students" },
    { name: "Subjects",    icon: BookOpen,         path: "/dashboard/hod/subjects" },
    { name: "Timetable",   icon: Calendar,         path: "/dashboard/hod/timetable" },
  ],

  [ROLES.PROGRAM_HEAD]: [
    { name: "Overview",   icon: LayoutDashboard, path: "/dashboard/program-head" },
    { name: "Sections",   icon: Layers,           path: "/dashboard/program-head/sections" },
    { name: "Subjects",   icon: BookOpen,         path: "/dashboard/program-head/subjects" },
    { name: "Timetable",  icon: Calendar,         path: "/dashboard/program-head/timetable" },
  ],

  [ROLES.FACULTY]: [
    { name: "Overview",   icon: LayoutDashboard, path: "/dashboard/faculty" },
    { name: "Attendance", icon: ClipboardList,    path: "/dashboard/faculty/attendance" },
    { name: "Subjects",   icon: BookOpen,         path: "/dashboard/faculty/subjects" },
    { name: "Timetable",  icon: Calendar,         path: "/dashboard/faculty/timetable" },
    { name: "Profile",    icon: User,             path: "/dashboard/faculty/profile" },
  ],

  [ROLES.STUDENT]: [
    { name: "Overview",   icon: LayoutDashboard, path: "/dashboard/student" },
    { name: "Subjects",   icon: BookOpen,         path: "/dashboard/student/subjects" },
    { name: "Timetable",  icon: Calendar,         path: "/dashboard/student/timetable" },
    { name: "Profile",    icon: User,             path: "/dashboard/student/profile" },
  ],

  [ROLES.PARENT]: [
    { name: "Overview",       icon: LayoutDashboard, path: "/dashboard/parent" },
    { name: "Child Progress", icon: BarChart3,        path: "/dashboard/parent/progress" },
    { name: "Timetable",      icon: Calendar,         path: "/dashboard/parent/timetable" },
    { name: "Profile",        icon: User,             path: "/dashboard/parent/profile" },
  ],
}

// Role display labels
const roleLabels: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]:       "Super Admin",
  [ROLES.ORG_ADMIN]:         "Org Admin",
  [ROLES.INSTITUTION_ADMIN]: "Institution Admin",
  [ROLES.HOD]:               "Head of Dept",
  [ROLES.PROGRAM_HEAD]:      "Program Head",
  [ROLES.FACULTY]:           "Faculty",
  [ROLES.STUDENT]:           "Student",
  [ROLES.PARENT]:            "Parent",
}

// Role accent colors (badge bg + text)
const roleAccents: Record<Role, { bg: string; color: string }> = {
  [ROLES.SUPER_ADMIN]:       { bg: "#fef3c7", color: "#92400e" },
  [ROLES.ORG_ADMIN]:         { bg: "#ede9fe", color: "#5b21b6" },
  [ROLES.INSTITUTION_ADMIN]: { bg: "#dbeafe", color: "#1e40af" },
  [ROLES.HOD]:               { bg: "#d1fae5", color: "#065f46" },
  [ROLES.PROGRAM_HEAD]:      { bg: "#fce7f3", color: "#9d174d" },
  [ROLES.FACULTY]:           { bg: "#e0f2fe", color: "#0c4a6e" },
  [ROLES.STUDENT]:           { bg: "#f0fdf4", color: "#166534" },
  [ROLES.PARENT]:            { bg: "#fdf4ff", color: "#701a75" },
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<{ name: string; role: Role } | null>(null)

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("name, role")
          .eq("id", user.id)
          .single()
        if (data) {
          setProfile({
            name: data.name ?? user.email?.split("@")[0] ?? "User",
            role: (data.role as Role) ?? ROLES.STUDENT,
          })
        } else {
          setProfile({
            name: user.email?.split("@")[0] ?? "User",
            role: ROLES.STUDENT,
          })
        }
      }
    }
    getProfile()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const menu: MenuItem[] = profile ? (roleMenus[profile.role] ?? []) : []
  const accent = profile ? (roleAccents[profile.role] ?? { bg: "#ede9fe", color: "#5b21b6" }) : { bg: "#ede9fe", color: "#5b21b6" }
  const roleLabel = profile ? (roleLabels[profile.role] ?? profile.role) : "Loading..."
  const initials = profile
    ? profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Syne:wght@700&display=swap');

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 12px;
          border-radius: 10px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s ease;
          font-family: 'DM Sans', sans-serif;
          user-select: none;
          position: relative;
        }
        .sidebar-link:hover {
          background: #f0efff;
          color: #4f46e5;
        }
        .sidebar-link:hover .sidebar-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .sidebar-link.active {
          background: linear-gradient(135deg, #4f46e5, #6d28d9);
          color: #fff;
          box-shadow: 0 4px 14px rgba(79,70,229,0.3);
        }
        .sidebar-arrow {
          margin-left: auto;
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.15s ease;
        }
        .sidebar-link.active .sidebar-arrow { display: none; }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          color: #9ca3af;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .logout-btn:hover {
          background: #fff1f2;
          color: #ef4444;
        }

        .user-card {
          padding: 12px 14px;
          background: #faf5ff;
          border-radius: 12px;
          border: 1px solid #ede9fe;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-skeleton {
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(90deg, #f3f0ff 25%, #e9e6ff 50%, #f3f0ff 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <aside style={{
        width: 236,
        background: "#fff",
        borderRight: "1px solid #ede9fe",
        display: "flex",
        flexDirection: "column",
        padding: "22px 14px",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        flexShrink: 0,
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px 20px" }}>
          <div style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
            flexShrink: 0,
          }}>
            <Sparkles size={15} color="#fff" />
          </div>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700, fontSize: 18,
            color: "#1e1b4b", letterSpacing: "-0.3px",
          }}>
            SkillArc
          </span>
        </div>

        {/* Role badge */}
        {profile && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: accent.bg,
            color: accent.color,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: 99,
            marginBottom: 20,
            width: "fit-content",
          }}>
            <ShieldCheck size={10} />
            {roleLabel}
          </div>
        )}

        {/* Section label */}
        <div style={{
          fontSize: 10, fontWeight: 700, color: "#c4b5fd",
          letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "0 6px 10px",
        }}>
          Navigation
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {!profile ? (
            // Loading skeleton
            [1,2,3,4].map(i => (
              <div key={i} className="sidebar-skeleton" style={{ marginBottom: 4 }} />
            ))
          ) : menu.length === 0 ? (
            <div style={{ fontSize: 12, color: "#9ca3af", padding: "8px 12px" }}>
              No menu for role: {profile.role}
            </div>
          ) : (
            menu.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.path ||
                (item.path === "/dashboard" && pathname === "/dashboard")
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`sidebar-link${isActive ? " active" : ""}`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                  {!isActive && (
                    <span className="sidebar-arrow">
                      <ChevronRight size={13} />
                    </span>
                  )}
                </Link>
              )
            })
          )}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: "#f3f0ff", margin: "12px 0" }} />

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={15} style={{ transition: "color 0.15s" }} />
          <span>Log out</span>
        </button>

        {/* Divider */}
        <div style={{ height: 1, background: "#f3f0ff", margin: "12px 0" }} />

        {/* User card */}
        <div className="user-card">
          <div style={{
            width: 34, height: 34,
            background: `linear-gradient(135deg, #4f46e5, #a78bfa)`,
            borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: "#1e1b4b",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {profile ? profile.name : "Loading..."}
            </div>
            <div style={{ fontSize: 11, color: accent.color }}>
              {roleLabel}
            </div>
          </div>
        </div>

      </aside>
    </>
  )
}