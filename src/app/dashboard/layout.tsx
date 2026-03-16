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

      <div className="flex min-h-screen bg-[#f8f7ff] font-sans">

        <Sidebar />

        <div className="flex flex-col flex-1 min-w-0">

          <Navbar />

          <main className="p-7 flex-1">
            {children}
          </main>

        </div>

      </div>

    </CourseProvider>
  )
}