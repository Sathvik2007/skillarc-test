import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import { CourseProvider } from "@/modules/courses/course-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CourseProvider>
      <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(108,99,255,0.16),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.14),_transparent_18%),radial-gradient(circle_at_bottom_left,_rgba(0,194,168,0.12),_transparent_18%),linear-gradient(180deg,#f8fafc,#eff6ff)] text-slate-950">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Navbar />
          <main className="p-6 md:p-8 lg:p-10">
            <div className="glass-panel rounded-[28px] border border-[rgba(15,23,42,0.06)] shadow-[0_20px_60px_rgba(15,23,42,0.08)] min-h-[calc(100vh-90px)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </CourseProvider>
  )
}