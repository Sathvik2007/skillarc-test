// components/charts/index.tsx
"use client";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";

// ── Colour palette ─────────────────────────────────────────────────────────────
const COLORS = ["#6366f1","#14b8a6","#f59e0b","#f43f5e","#38bdf8","#22c55e","#a78bfa","#fb923c"];

// ── Shared tooltip style ───────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  backgroundColor: "#111827",
  border:          "1px solid #1f2d45",
  borderRadius:    "8px",
  color:           "#f1f5f9",
  fontSize:        "12px",
};

// ── Area chart ─────────────────────────────────────────────────────────────────
export function ApexAreaChart({ data, dataKey, xKey = "year", color = "#6366f1" }: {
  data: Record<string, unknown>[];
  dataKey: string;
  xKey?: string;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false}/>
        <XAxis dataKey={xKey} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "#1f2d45" }}/>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
              fill={`url(#grad-${dataKey})`}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Bar chart ──────────────────────────────────────────────────────────────────
export function ApexBarChart({ data, dataKey, xKey = "name", color = "#6366f1", horizontal = false }: {
  data: Record<string, unknown>[];
  dataKey: string;
  xKey?: string;
  color?: string;
  horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 4, right: 4, left: horizontal ? 60 : -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45"
                       horizontal={!horizontal} vertical={horizontal}/>
        {horizontal
          ? <>
              <YAxis dataKey={xKey} type="category" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} width={56}/>
              <XAxis type="number" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false}/>
            </>
          : <>
              <XAxis dataKey={xKey} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false}/>
            </>
        }
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(99,102,241,0.06)" }}/>
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]}/>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Multi-line chart ───────────────────────────────────────────────────────────
export function ApexLineChart({ data, lines, xKey = "year" }: {
  data: Record<string, unknown>[];
  lines: { key: string; label: string; color?: string }[];
  xKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false}/>
        <XAxis dataKey={xKey} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false}/>
        <Tooltip contentStyle={TOOLTIP_STYLE}/>
        <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}/>
        {lines.map((l, i) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.label}
                stroke={l.color ?? COLORS[i % COLORS.length]}
                strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }}/>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Donut / Pie chart ─────────────────────────────────────────────────────────
export function ApexPieChart({ data, nameKey = "name", valueKey = "value" }: {
  data: Record<string, unknown>[];
  nameKey?: string;
  valueKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%"
             innerRadius={55} outerRadius={80}
             dataKey={valueKey} nameKey={nameKey}
             paddingAngle={3}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]}/>
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE}/>
        <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}/>
      </PieChart>
    </ResponsiveContainer>
  );
}
