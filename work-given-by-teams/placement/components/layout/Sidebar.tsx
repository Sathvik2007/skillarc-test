// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";
import {
  LayoutDashboard, Users, Building2, CalendarPlus,
  Mic, Video, BarChart3, GraduationCap, LogOut,
} from "lucide-react";

const NAV_ITEMS: Record<Role, { href: string; label: string; icon: React.ReactNode }[]> = {
  Official: [
    { href: "/dashboard",            label: "Overview",         icon: <LayoutDashboard size={16}/> },
    { href: "/dashboard/students",   label: "Students",         icon: <Users           size={16}/> },
    { href: "/dashboard/companies",  label: "Companies",        icon: <Building2       size={16}/> },
    { href: "/dashboard/drives",     label: "Drives",           icon: <CalendarPlus    size={16}/> },
    { href: "/dashboard/analytics",  label: "Analytics",        icon: <BarChart3       size={16}/> },
    { href: "/dashboard/interview",  label: "Mock Interview",   icon: <Video           size={16}/> },
    { href: "/dashboard/comms",      label: "Communication",    icon: <Mic             size={16}/> },
  ],
  Admin: [
    { href: "/dashboard",            label: "Overview",         icon: <LayoutDashboard size={16}/> },
    { href: "/dashboard/companies",  label: "My Company",       icon: <Building2       size={16}/> },
    { href: "/dashboard/drives",     label: "Register Drive",   icon: <CalendarPlus    size={16}/> },
  ],
  Student: [
    { href: "/dashboard",            label: "My Profile",       icon: <GraduationCap   size={16}/> },
    { href: "/dashboard/interview",  label: "Mock Interview",   icon: <Video           size={16}/> },
  ],
};

interface SidebarProps {
  role: Role;
  username: string;
}

export default function Sidebar({ role, username }: SidebarProps) {
  const pathname = usePathname();

  const roleColors: Record<Role, string> = {
    Official: "bg-primary/10 text-primary",
    Admin:    "bg-accent-teal/10 text-accent-teal",
    Student:  "bg-accent-amber/10 text-accent-amber",
  };

  async function handleLogout() {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {
      // Ignore network errors — redirect anyway
    }
    window.location.href = "/login";
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col border-r border-background-border bg-background-card"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div className="px-4 py-5 border-b border-background-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap size={16} className="text-white"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary leading-none">Apex</p>
            <p className="text-[10px] text-text-muted mt-0.5">Placement Intelligence</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-0.5">
        <p className="section-title px-1 mb-3">Menu</p>
        {NAV_ITEMS[role].map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={cn("nav-item", active && "active")}>
              {icon}
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── User info + logout ────────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-background-border space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-semibold text-primary">
              {username[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">{username}</p>
            <span className={cn("badge text-[10px] px-1.5 py-0 mt-0.5", roleColors[role])}>
              {role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-item w-full text-danger hover:bg-danger/10 hover:text-danger"
        >
          <LogOut size={15}/>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
