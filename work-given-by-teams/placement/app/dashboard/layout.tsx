// app/dashboard/layout.tsx
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import type { Role } from "@/types";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("apex_token")?.value;
  if (!token) redirect("/login");

  const user = await verifyToken(token);
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={user.role as Role} username={user.username}/>
      <main
        className="flex-1 overflow-y-auto bg-background"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        <div className="p-6 max-w-7xl mx-auto animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}
