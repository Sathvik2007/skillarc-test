// src/components/placements-ui.tsx — Self-contained UI components for Placements

import React from "react";
import { cn } from "@/lib/utils";

// ── Card ───────────────────────────────────────────────────────────
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  icon?: React.ReactNode;
  accent?: string;
}

export function StatCard({ label, value, delta, deltaUp, icon, accent }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-1 hover:border-violet-200 transition-all hover:shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className={cn("p-2 rounded-lg flex items-center justify-center text-sm", accent ?? "bg-violet-50 text-violet-600")}>
            {icon}
          </span>
        )}
      </div>
      <span className="text-2xl font-bold text-slate-800 mt-1">{value}</span>
      {delta && (
        <span className={cn("text-xs font-medium mt-1 flex items-center gap-1", deltaUp ? "text-emerald-600" : "text-rose-600")}>
          {deltaUp ? "▲" : "▼"} {delta}
        </span>
      )}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────
type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export function Badge({ variant = "neutral", className, children, ...props }: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLSpanElement>) {
  const styles: Record<BadgeVariant, string> = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    info: "bg-violet-50 text-violet-700 border-violet-100",
    neutral: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

// ── Button ─────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, className, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
    const styles = {
      primary: "bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-100",
      secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
      ghost: "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
    };

    return (
      <button
        ref={ref}
        className={cn(base, styles[variant], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// ── Input ──────────────────────────────────────────────────────────
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-colors placeholder:text-slate-400",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

// ── Select ─────────────────────────────────────────────────────────
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

// ── Skeleton loader ────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-slate-100 rounded-lg", className)} />
  );
}

// ── Section header ─────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────
export function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      {icon && <div className="mb-3 text-slate-300">{icon}</div>}
      <p className="text-slate-400 text-sm font-medium">{message}</p>
    </div>
  );
}
