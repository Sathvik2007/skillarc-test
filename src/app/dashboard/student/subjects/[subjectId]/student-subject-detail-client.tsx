"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  MessageSquare,
  ListTodo,
  Users,
  FileCode,
  CheckCircle2,
  Clock,
  FileText,
  Megaphone,
  Download,
  Eye,
  Brain,
  BookOpen,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Calendar,
  ChevronRight,
  UserRound,
  Video,
  Play
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface StudentSubjectDetailClientProps {
  studentId: string
  studentName: string
  studentSectionId: string
  subject: {
    id: string
    name: string
    code: string
  }
  facultyName: string
  assignments: Array<any>
  submissions: Array<any>
  classmates: Array<any>
  meetings: Array<any>
}

export function StudentSubjectDetailClient({
  studentId,
  studentName,
  studentSectionId,
  subject,
  facultyName,
  assignments,
  submissions,
  classmates,
  meetings,
}: StudentSubjectDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"stream" | "classwork" | "people" | "meetings">("classwork")

  // Real-time meetings state for active classroom classes
  const [localMeetings, setLocalMeetings] = useState<any[]>(meetings)

  useEffect(() => {
    setLocalMeetings(meetings)
  }, [meetings])

  useEffect(() => {
    const channel = supabase
      .channel("student_live_meetings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meetings", filter: `subject_id=eq.${subject.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setLocalMeetings(prev => {
              if (prev.some(m => m.id === payload.new.id)) return prev
              return [payload.new, ...prev]
            })
          } else if (payload.eventType === "UPDATE") {
            setLocalMeetings(prev => prev.map(m => m.id === payload.new.id ? payload.new : m))
          } else if (payload.eventType === "DELETE") {
            setLocalMeetings(prev => prev.filter(m => m.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [subject.id])

  // Merge announcements (materials with no due date) and other materials into Stream
  const announcementsList = assignments.filter(a => a.type === "Material" && !a.due_date)
  const materialsList = assignments.filter(a => a.type === "Material" && a.due_date)

  const streamItems = [
    ...announcementsList.map(a => ({ kind: "announcement" as const, id: a.id, date: a.created_at, data: a })),
    ...materialsList.map(m => ({ kind: "material" as const, id: m.id, date: m.created_at, data: m })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Helper to map assignment ID to student submission status
  const getAssignmentStatusMeta = (item: any) => {
    if (item.type === "Material" || item.type === "material") {
      return { label: "Available", bg: "bg-amber-50 border-amber-200 text-amber-700", icon: <Eye size={12} /> }
    }

    const sub = submissions.find(s => s.assignment_id === item.id)
    if (!sub) {
      if (item.due_date && new Date(item.due_date).getTime() < Date.now()) {
        return { label: "Missing", bg: "bg-red-50 border-red-200 text-red-700", icon: <AlertCircle size={12} /> }
      }
      return { label: "Pending", bg: "bg-orange-50 border-orange-200 text-orange-700", icon: <Clock size={12} /> }
    }

    if (sub.status === "graded") {
      return { label: `Graded: ${sub.grade}/${item.max_score}`, bg: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: <CheckCircle2 size={12} /> }
    }

    return { label: "Submitted", bg: "bg-blue-50 border-blue-200 text-blue-700", icon: <CheckCircle size={12} /> }
  }

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return "No due date"
    const d = new Date(dueDate)
    if (isNaN(d.getTime())) return dueDate
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const typeConfig = {
    'Assignment': { icon: FileText, color: 'text-green-600', bg: 'bg-green-100', label: 'Assignment' },
    'Quiz': { icon: Brain, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Quiz' },
    'Coding Assignment': { icon: FileCode, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Coding' },
    'Material': { icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Material' },
  } as any

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-800 px-8 py-10 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="relative z-10 max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/dashboard/student/subjects" className="text-white/80 hover:text-white flex items-center gap-1 text-sm font-semibold mb-3 transition-colors">
              <ArrowLeft size={16} /> Back to subjects
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{subject.name}</h1>
            <p className="text-teal-100 font-medium mt-1">
              Code: {subject.code} • Teacher: {facultyName}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 text-white flex items-center gap-3">
            <ListTodo size={20} className="text-teal-200" />
            <div>
              <div className="text-xl font-bold">{assignments.filter(a => a.type !== "Material").length}</div>
              <div className="text-[10px] uppercase font-bold text-teal-200">Assignments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
          <nav className="flex space-x-8">
            {[
              { id: "classwork", label: "Classwork / Submissions", icon: ListTodo },
              { id: "meetings", label: "Video Classroom", icon: Video },
              { id: "stream", label: "Stream / Feed", icon: MessageSquare },
              { id: "people", label: "Class Roster", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-semibold text-sm transition-all ${
                  activeTab === tab.id
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? "text-teal-600" : "text-slate-400"}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-grow max-w-6xl w-full mx-auto p-8 space-y-6">
        
        {/* Real-time Live Lecture Banner Alert */}
        {localMeetings.some(m => m.is_active) && (
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 border border-red-500 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse text-left">
            <div className="flex items-center gap-3.5">
              <span className="w-4 h-4 rounded-full bg-white animate-ping flex-shrink-0" />
              <div>
                <h3 className="text-sm font-extrabold tracking-tight">LIVE LECTURE MEETING IN PROGRESS</h3>
                <p className="text-xs text-rose-100 font-sans mt-0.5 font-normal">
                  Your professor is conducting a live classroom lecture: <span className="font-bold">"{localMeetings.find(m => m.is_active)?.title}"</span>. Click Join to launch.
                </p>
              </div>
            </div>
            <a
              href={`/meetings/${localMeetings.find(m => m.is_active)?.meeting_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white text-red-600 hover:bg-slate-50 font-bold rounded-xl text-xs shadow-md transition-all whitespace-nowrap flex-shrink-0"
            >
              Join Live Lecture
            </a>
          </div>
        )}

        {/* Tab 1: Classwork */}
        {activeTab === "classwork" && (
          <div className="space-y-6">
            {assignments.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-slate-700 font-bold text-lg">No coursework found</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">There are no assignments, quizzes or resources posted for your section yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((item) => {
                  const cfg = typeConfig[item.type] || typeConfig["Assignment"]
                  const Icon = cfg.icon
                  const statusMeta = getAssignmentStatusMeta(item)

                  return (
                    <Link
                      key={item.id}
                      href={`/dashboard/student/subjects/${subject.id}/assignments/${item.id}`}
                      className="block"
                    >
                      <div className="group bg-white border border-slate-200 hover:border-teal-400 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-800 text-sm truncate group-hover:text-teal-600 transition-colors">{item.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] font-semibold text-slate-400">
                              <span className="flex items-center gap-1 font-medium"><Calendar size={12} /> Due {formatDueDate(item.due_date)}</span>
                              {item.type !== "Material" && (
                                <span className="font-medium">Max Score: {item.max_score}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                          <span className={`text-[10px] font-extrabold border px-2.5 py-1 rounded-full flex items-center gap-1 ${statusMeta.bg}`}>
                            {statusMeta.icon}
                            {statusMeta.label}
                          </span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Stream */}
        {activeTab === "stream" && (
          <div className="space-y-6">
            {streamItems.length === 0 ? (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl text-slate-400">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">Nothing posted yet</h4>
                <p className="text-xs text-slate-400 mt-1">Announcements and reference materials will show up in this feed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {streamItems.map((item) => {
                  if (item.kind === "announcement") {
                    const ann = item.data
                    return (
                      <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                          <Megaphone size={18} />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-center">
                            <h4 className="font-extrabold text-slate-800 text-sm">{facultyName}</h4>
                            <div className="text-[10px] text-slate-400 font-semibold">
                              {new Date(ann.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 font-normal leading-relaxed mt-2 whitespace-pre-wrap">{ann.description}</p>
                        </div>
                      </div>
                    )
                  } else {
                    const mat = item.data
                    return (
                      <div key={item.id} className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                          <BookOpen size={18} />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-center">
                            <h4 className="font-extrabold text-slate-800 text-sm">{facultyName} posted new resource</h4>
                            <div className="text-[10px] text-slate-400 font-semibold">
                              {new Date(mat.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                            </div>
                          </div>
                          <div className="border border-amber-100 rounded-xl p-4 mt-3 bg-amber-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText size={18} className="text-amber-600" />
                              <span className="font-bold text-xs text-slate-800">{mat.title}</span>
                            </div>
                            <Link href={`/dashboard/student/subjects/${subject.id}/assignments/${mat.id}`}>
                              <span className="text-[10px] text-amber-700 bg-white hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-lg font-bold cursor-pointer transition-all">
                                View Material
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: People */}
        {activeTab === "people" && (
          <div className="space-y-8">
            {/* Faculty Section */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-4 border-b pb-2">Faculty Advisor / Teacher</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
                  {facultyName.split(" ").map(n => n[0]).join("").substring(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{facultyName}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Subject Teacher</p>
                </div>
              </div>
            </div>

            {/* Classmates Section */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-4 border-b pb-2">Classmates ({classmates.length})</h3>
              <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                {classmates.map((student) => (
                  <div key={student.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                        {student.name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <span className="font-bold text-slate-700 text-xs">{student.name}</span>
                    </div>
                    {student.id === studentId && (
                      <span className="text-[9px] font-bold bg-teal-50 border border-teal-200 text-teal-700 px-2 py-0.5 rounded">You</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Video Classroom */}
        {activeTab === "meetings" && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-left">
            <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Video size={18} className="text-teal-600" /> Subject Lecture Log
              </h3>
              <span className="text-xs font-bold bg-teal-50 border border-teal-100 text-teal-600 px-3 py-1 rounded-full">
                {localMeetings.length} Lectures Total
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {localMeetings.map((m) => {
                const startStr = m.scheduled_start ? new Date(m.scheduled_start).toLocaleString() : new Date(m.started_at).toLocaleString()
                return (
                  <div key={m.id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${m.is_active ? "bg-red-500 animate-pulse" : "bg-slate-300"}`} />
                        <h4 className="font-extrabold text-sm text-slate-800">{m.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold font-sans">
                        Session: <span className="capitalize">{m.meeting_type}</span> • Timing: {startStr}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {m.is_active ? (
                        <a
                          href={`/meetings/${m.meeting_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all"
                        >
                          Join Live Lecture
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Lecture Completed</span>
                      )}
                    </div>
                  </div>
                )
              })}

              {localMeetings.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Video className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No virtual lecture schedules are posted for your section yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
