import React from "react";
import { Link } from "react-router";
import { TopNav } from "../components/TopNav";
import { useAppContext } from "../context/AppContext";
import { Plus, Users, FolderOpen } from "lucide-react";

export function FacultyDashboard() {
  const { classes, setCreateModalOpen } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNav role="faculty" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-500 mt-1">Manage your active classrooms and assignments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => (
            <Link
              key={c.id}
              to={`/faculty/class/${c.id}`}
              className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col h-full"
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
                <div className="text-sm font-medium text-gray-600 mb-4">{c.section} {c.subjectCode ? `• ${c.subjectCode}` : ''}</div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Users className="w-4 h-4 mr-1.5" />
                    {c.studentsCount} Students
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <span className="text-indigo-600 font-medium text-xs">View</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Create Class Action Card */}
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="group border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-400 hover:text-indigo-700 transition-all duration-200 flex flex-col items-center justify-center p-8 h-full min-h-[220px]"
          >
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-300">
              <Plus className="w-6 h-6 text-slate-400 group-hover:text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-600 group-hover:text-indigo-700">Create a new classroom</span>
            <span className="text-sm text-slate-400 mt-1">Setup workspace & enroll students</span>
          </button>
        </div>
      </main>
    </div>
  );
}
