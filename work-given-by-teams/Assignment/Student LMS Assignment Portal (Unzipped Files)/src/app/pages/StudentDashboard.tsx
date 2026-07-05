import React, { useState } from "react";
import { Link } from "react-router";
import { TopNav } from "../components/TopNav";
import { useAppContext } from "../context/AppContext";
import { CheckSquare, FolderOpen } from "lucide-react";
import { JoinClassModal } from "../components/JoinClassModal";

export function StudentDashboard() {
  const { classes } = useAppContext();
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNav role="student" onJoinClass={() => setJoinOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Classrooms</h1>
          <p className="text-gray-500 mt-1">Access your enrolled courses and upcoming tasks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => {
            return (
              <Link
                key={c.id}
                to={`/student/class/${c.id}`}
                className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-teal-300 transition-all duration-200 flex flex-col h-full"
              >
                <div className={`${c.color} h-24 p-5 flex items-end relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <FolderOpen className="w-24 h-24 text-white -mt-8 -mr-8" />
                  </div>
                  <h2 className="text-xl font-bold text-white relative z-10 truncate w-full" title={c.name}>
                    {c.name}
                  </h2>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-sm font-medium text-gray-800 mb-1">Dr. Smith</div>
                  <div className="text-xs text-gray-500">{c.section}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <JoinClassModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
