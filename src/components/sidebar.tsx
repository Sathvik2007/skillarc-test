"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Award,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react"

const menu = [
  { name: "Dashboard",   icon: LayoutDashboard, path: "/dashboard",              badge: null },
  { name: "Courses",     icon: BookOpen,         path: "/dashboard/courses",      badge: 3    },
  { name: "Assignments", icon: FileText,          path: "/dashboard/assignments",  badge: 12   },
  { name: "Students",    icon: Users,             path: "/dashboard/students",     badge: null },
  { name: "Certificates",icon: Award,             path: "/dashboard/certificates", badge: null },
  { name: "Settings",    icon: Settings,          path: "/dashboard/settings",     badge: null },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Syne:wght@700&display=swap');

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          color: #6b7280;
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.18s ease;
          font-family: 'DM Sans', sans-serif;
          user-select: none;
        }
        .sidebar-link:hover {
          background: #f0efff;
          color: #4f46e5;
        }
        .sidebar-link.active {
          background: #4f46e5;
          color: #fff;
          box-shadow: 0 4px 14px rgba(79,70,229,0.32);
        }

        .sidebar-badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 600;
          background: #ede9fe;
          color: #7c3aed;
          padding: 1px 7px;
          border-radius: 20px;
        }
        .sidebar-link.active .sidebar-badge {
          background: rgba(255,255,255,0.25);
          color: #fff;
        }

        .sidebar-logout:hover { color: #ef4444 !important; }
      `}</style>

      <aside style={{
        width: 240,
        background: "#fff",
        borderRight: "1px solid #ede9fe",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        flexShrink: 0,
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px 28px" }}>
          <div style={{
            width: 34,
            height: 34,
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(79,70,229,0.35)",
            flexShrink: 0,
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "#1e1b4b",
            letterSpacing: "-0.3px",
          }}>
            Learnify
          </span>
        </div>

        {/* Section label */}
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          color: "#a78bfa",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "0 6px 10px",
        }}>
          Navigation
        </div>

        {/* Menu links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {menu.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.path

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-link${isActive ? " active" : ""}`}
              >
                <Icon size={17} />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User card */}
        <div style={{
          marginTop: 16,
          padding: "12px 14px",
          background: "#faf5ff",
          borderRadius: 12,
          border: "1px solid #ede9fe",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <div style={{
            width: 34,
            height: 34,
            background: "linear-gradient(135deg, #4f46e5, #a78bfa)",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}>
            JD
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Jane Doe
            </div>
            <div style={{ fontSize: 11, color: "#7c3aed" }}>Instructor</div>
          </div>
          <LogOut
            size={14}
            color="#9ca3af"
            className="sidebar-logout"
            style={{ cursor: "pointer", flexShrink: 0, transition: "color 0.15s" }}
          />
        </div>

      </aside>
    </>
  )
}