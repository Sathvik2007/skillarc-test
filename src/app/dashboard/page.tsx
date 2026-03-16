import DashboardCard from "@/components/dashboard-card"

const font = "'Plus Jakarta Sans', 'DM Sans', sans-serif"

export default function DashboardPage() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f4f5f7",
      padding: 24,
      fontFamily: font,
    }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
          Thursday, March 12, 2026
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 28,
      }}>
        <DashboardCard title="Total Courses" value="12" />
        <DashboardCard title="Total Students" value="240" />
        <DashboardCard title="Assignments Due" value="8" />
        <DashboardCard title="Completion Rate" value="78%" />
      </div>

      {/* Placeholder content area */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: 16,
        border: "1px solid #f3f4f6",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        padding: "20px 24px",
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Recent Activity</p>
        <p style={{ fontSize: 11, color: "#9ca3af" }}>Your recent course and assignment activity will appear here.</p>
      </div>
    </div>
  )
}