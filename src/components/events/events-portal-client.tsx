// src/components/events/events-portal-client.tsx
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Calendar as CalIcon, MapPin, User as UserIcon, Users, Search, Plus, Grid, List, CheckCircle2,
  ChevronLeft, ChevronRight, X, Clock, Tag
} from "lucide-react";
import { Card, Badge, Button, Input, Select, SectionHeader, EmptyState, Skeleton } from "@/components/placements-ui";

interface EventItem {
  id: string;
  name: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  description: string;
  capacity: number;
  filled: number;
  organizer: string;
  organizerRole?: string;
  tags: string[];
  registeredUsers: string[];
}

const DEPT_NAMES: Record<string, string> = {
  "computer-science": "Computer Science",
  "mathematics": "Mathematics",
  "physics": "Physics",
  "chemistry": "Chemistry",
  "biology": "Biology",
  "english": "English",
  "history": "History",
};

const DEPT_COLORS: Record<string, string> = {
  "computer-science": "violet",
  "mathematics": "indigo",
  "physics": "pink",
  "chemistry": "amber",
  "biology": "emerald",
  "english": "sky",
  "history": "rose",
};

const DEPT_COLOR_HEX: Record<string, string> = {
  "computer-science": "#8b5cf6",
  "mathematics": "#6366f1",
  "physics": "#ec4899",
  "chemistry": "#f59e0b",
  "biology": "#10b981",
  "english": "#06b6d4",
  "history": "#ef4444",
};

export default function EventsPortalClient() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("student");
  const [institutionId, setInstitutionId] = useState<string | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [timeline, setTimeline] = useState("all"); // all, upcoming, today, past
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // UI Toast Message
  const [toastMessage, setToastMessage] = useState("");

  // New Event Form Modal
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    department: "computer-science",
    date: "",
    time: "",
    location: "",
    organizer: "",
    organizerRole: "",
    capacity: "100",
    description: "",
    tags: "",
  });

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // July 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Fetch current user details from Supabase auth
  useEffect(() => {
    async function getUserDetails() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data } = await supabase
            .from("users")
            .select("role, institution_id")
            .eq("id", user.id)
            .single();
          if (data) {
            setUserRole(data.role || "student");
            setInstitutionId(data.institution_id || null);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    getUserDetails();
  }, []);

  // Fetch Events from Supabase Database
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          event_date,
          venue,
          created_by,
          event_registrations (
            user_id
          )
        `)
        .order("event_date", { ascending: true });

      if (error) throw error;

      const mapped: EventItem[] = (data || []).map((e: any) => {
        let descText = e.description || "";
        let deptName = "computer-science";
        let tagsList: string[] = ["Academic"];
        
        try {
          const json = JSON.parse(e.description);
          if (json && typeof json === "object" && "description" in json) {
            descText = json.description;
            deptName = json.department || "computer-science";
            tagsList = json.tags || [];
          }
        } catch {
          // Plain text fallback
        }

        let dateVal = "2026-07-01";
        let timeVal = "12:00";
        if (e.event_date) {
          const dt = new Date(e.event_date);
          dateVal = dt.toISOString().split("T")[0];
          timeVal = dt.toTimeString().slice(0, 5);
        }

        const registeredUsers = e.event_registrations?.map((r: any) => r.user_id) || [];

        return {
          id: e.id,
          name: e.title || "Untitled Event",
          department: deptName,
          date: dateVal,
          time: timeVal,
          location: e.venue || "Campus Hall",
          description: descText,
          capacity: 100,
          filled: registeredUsers.length,
          organizer: "Staff Coordinator",
          organizerRole: "Faculty",
          tags: tagsList,
          registeredUsers,
        };
      });

      setEvents(mapped);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const isCoordinator = ["super_admin", "org_admin", "institution_admin", "hod", "program_head", "faculty"].includes(userRole?.toLowerCase());

  // Timeline Helper
  const getTimelineStatus = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ev = new Date(dateStr);
    ev.setHours(0, 0, 0, 0);
    if (ev < today) return "past";
    if (ev.getTime() === today.getTime()) return "today";
    return "upcoming";
  };

  const filteredEvents = events.filter((e) => {
    const status = getTimelineStatus(e.date);
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === "all" ? true : e.department === dept;
    const matchTimeline =
      timeline === "all" ? true :
      timeline === "upcoming" ? status === "upcoming" || status === "today" :
      timeline === "today" ? status === "today" :
      status === "past";

    const matchCalendarDate = selectedDateStr ? e.date === selectedDateStr : true;

    return matchSearch && matchDept && matchTimeline && matchCalendarDate;
  });

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const relatedEvents = selectedEvent
    ? events.filter(e => e.id !== selectedEvent.id && e.department === selectedEvent.department).slice(0, 3)
    : [];

  const handleRegister = async (id: string) => {
    if (!userId) {
      alert("You must be logged in to register.");
      return;
    }

    const match = events.find(e => e.id === id);
    if (!match) return;

    const isRegistered = match.registeredUsers.includes(userId);

    try {
      if (isRegistered) {
        const { error } = await supabase
          .from("event_registrations")
          .delete()
          .eq("event_id", id)
          .eq("user_id", userId);

        if (error) throw error;

        setEvents(prev => prev.map(e => e.id === id ? {
          ...e,
          filled: e.filled - 1,
          registeredUsers: e.registeredUsers.filter(x => x !== userId)
        } : e));
        triggerToast("Cancelled registration");
      } else {
        if (match.filled >= match.capacity) {
          alert("Event is full.");
          return;
        }

        const { error } = await supabase
          .from("event_registrations")
          .insert([{ event_id: id, user_id: userId }]);

        if (error) throw error;

        setEvents(prev => prev.map(e => e.id === id ? {
          ...e,
          filled: e.filled + 1,
          registeredUsers: [...e.registeredUsers, userId]
        } : e));
        triggerToast("Seat reserved successfully!");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Action failed. Please try again.");
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.date || !form.time || !userId) return;

    const descPayload = JSON.stringify({
      description: form.description,
      department: form.department,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()) : ["Event"]
    });

    const payload = {
      title: form.name,
      description: descPayload,
      event_date: `${form.date}T${form.time}:00`,
      venue: form.location || "Campus Hall",
      created_by: userId,
      institution_id: institutionId,
    };

    try {
      const { error } = await supabase
        .from("events")
        .insert([payload]);

      if (error) throw error;

      fetchEvents();
      setShowForm(false);
      setForm({
        name: "",
        department: "computer-science",
        date: "",
        time: "",
        location: "",
        organizer: "",
        organizerRole: "",
        capacity: "100",
        description: "",
        tags: "",
      });
      triggerToast("Event successfully scheduled");
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event in database.");
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i));
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Jain University Department Events Portal"
        subtitle="Explore and schedule academic conferences, bootcamps, and lectures"
        action={
          isCoordinator && (
            <Button variant="primary" className="text-xs" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Schedule Event
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Listing */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-4 border border-slate-100 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9 text-xs"
                placeholder="Search event title or keywords..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Select className="text-xs w-40" value={dept} onChange={e => setDept(e.target.value)}>
                <option value="all">All Departments</option>
                {Object.entries(DEPT_NAMES).map(([slug, name]) => (
                  <option key={slug} value={slug}>{name}</option>
                ))}
              </Select>

              <Select className="text-xs w-36" value={timeline} onChange={e => setTimeline(e.target.value)}>
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="today">Today</option>
                <option value="past">Past Events</option>
              </Select>

              {selectedDateStr && (
                <Badge variant="info" className="cursor-pointer hover:bg-violet-100" onClick={() => setSelectedDateStr(null)}>
                  Clear Date filter [x]
                </Badge>
              )}

              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white text-violet-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Grid size={14} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white text-violet-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-400">
            SHOWING <span className="text-slate-600">{filteredEvents.length}</span> ACTIVE EVENTS
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48" />)}
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState message="No scheduled events match your criteria" icon={<CalIcon size={32} />} />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((item) => {
                const status = getTimelineStatus(item.date);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEventId(item.id)}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-violet-100 hover:translate-y-[-2px] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div
                        className="h-28 flex items-end p-4 relative"
                        style={{
                          background: `linear-gradient(135deg, ${DEPT_COLOR_HEX[item.department] || "#8b5cf6"}ee, ${DEPT_COLOR_HEX[item.department] || "#8b5cf6"}aa)`,
                        }}
                      >
                        <div className="absolute top-3 right-3 bg-white/95 text-slate-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">
                          {status === "today" ? "Today" : status === "past" ? "Closed" : "Upcoming"}
                        </div>
                        <Badge variant="neutral" className="bg-black/40 text-white border-none text-[10px] font-bold">
                          {DEPT_NAMES[item.department] || "General"}
                        </Badge>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{item.name}</h4>
                        <div className="space-y-1 text-xs text-slate-500 font-medium">
                          <p className="flex items-center gap-1.5"><CalIcon size={12} className="text-slate-400" /> {item.date}</p>
                          <p className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400" /> {item.time}</p>
                          <p className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400 text-xs" /> {item.location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold">{item.organizer}</span>
                      <span className="font-bold text-slate-600">{item.capacity - item.filled} seats left</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((item) => {
                const status = getTimelineStatus(item.date);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEventId(item.id)}
                    className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-sm hover:border-slate-200 transition-all"
                  >
                    <div
                      className="w-2.5 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: DEPT_COLOR_HEX[item.department] || "#8b5cf6" }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        {DEPT_NAMES[item.department] || "General"} · {item.date} at {item.time} · {item.location}
                      </p>
                    </div>
                    <Badge variant={status === "today" ? "warning" : status === "past" ? "neutral" : "success"}>
                      {status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Calendar */}
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-800">{monthNames[month]} {year}</span>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft size={14} /></button>
                <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronRight size={14} /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-wide">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d}>{d}</span>)}
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
              {calendarDays.map((day, index) => {
                if (!day) return <span key={`empty-${index}`} />;
                const dayNum = day.getDate();
                const yearStr = day.getFullYear();
                const monthStr = String(day.getMonth() + 1).padStart(2, "0");
                const dateStr = `${yearStr}-${monthStr}-${String(dayNum).padStart(2, "0")}`;

                const dayEvents = events.filter(e => e.date === dateStr);
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDateStr === dateStr;

                return (
                  <button
                    key={`day-${index}`}
                    onClick={() => setSelectedDateStr(isSelected ? null : dateStr)}
                    className={`h-7 w-7 rounded-full flex flex-col items-center justify-center font-medium mx-auto relative transition-colors ${
                      isSelected
                        ? "bg-violet-600 text-white font-bold"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasEvents && !isSelected && (
                      <span className="absolute bottom-0.5 w-1 h-1 bg-violet-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-4 bg-slate-50/50">
            <h4 className="font-bold text-xs text-slate-400 mb-2 uppercase tracking-wider">Instructions</h4>
            <ul className="text-xs font-semibold text-slate-500 space-y-1.5 list-disc list-inside">
              <li>Click on calendar days to filter.</li>
              <li>Select any event to view details.</li>
              <li>Register online to reserve seats.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Bento Spotlight */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end animate-fade-in" onClick={() => setSelectedEventId(null)}>
          <div
            className="w-full max-w-2xl bg-white h-screen flex flex-col justify-between overflow-y-auto p-6 animate-slide-in shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge variant="info" className="mb-2 text-[10px] font-bold">
                    {DEPT_NAMES[selectedEvent.department] || "General"} Department
                  </Badge>
                  <h2 className="text-xl font-bold text-slate-800 leading-snug">{selectedEvent.name}</h2>
                </div>
                <button onClick={() => setSelectedEventId(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div
                className="h-40 w-full rounded-2xl mb-6 flex flex-col justify-end p-4 relative"
                style={{
                  background: `linear-gradient(135deg, ${DEPT_COLOR_HEX[selectedEvent.department] || "#8b5cf6"}ee, ${DEPT_COLOR_HEX[selectedEvent.department] || "#8b5cf6"}77)`,
                }}
              >
                <div className="text-white text-xs font-bold drop-shadow-sm flex items-center gap-1">
                  <MapPin size={12} /> {selectedEvent.location}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Details & Agenda</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-0.5">Date & Time</p>
                    <p className="text-slate-700 font-semibold">{selectedEvent.date} · {selectedEvent.time}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-0.5">Coordinator</p>
                    <p className="text-slate-700 font-semibold">{selectedEvent.organizer} ({selectedEvent.organizerRole || "Faculty"})</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Seats Reservation</span>
                    <span>{selectedEvent.filled} / {selectedEvent.capacity} filled</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600" style={{ width: `${(selectedEvent.filled / selectedEvent.capacity) * 100}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedEvent.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                      <Tag size={8} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {userId && (
              <div className="border-t border-slate-100 pt-4 mt-6 flex gap-3">
                <Button
                  variant={selectedEvent.registeredUsers.includes(userId) ? "secondary" : "primary"}
                  className="flex-1"
                  onClick={() => handleRegister(selectedEvent.id)}
                >
                  {selectedEvent.registeredUsers.includes(userId) ? (
                    <span className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold"><CheckCircle2 size={15} /> Registered</span>
                  ) : (
                    "Reserve My Seat"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Scheduling */}
      {showForm && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 flex flex-col justify-between animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalIcon className="text-violet-600" size={16} />
                <h3 className="font-bold text-slate-800">Schedule Department Event</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={15} /></button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Event Title *</label>
                <Input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Department</label>
                  <Select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                    {Object.entries(DEPT_NAMES).map(([slug, name]) => (
                      <option key={slug} value={slug}>{name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Seats Capacity</label>
                  <Input type="number" min="5" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Date *</label>
                  <Input type="date" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Time *</label>
                  <Input type="time" required value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Staff Coordinator</label>
                  <Input value={form.organizer} onChange={e => setForm(p => ({ ...p, organizer: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Coordinator Designation</label>
                  <Input value={form.organizerRole} onChange={e => setForm(p => ({ ...p, organizerRole: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Location Venue</label>
                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <textarea
                  className="w-full p-3 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                  rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Publish Event</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border-l-4 border-violet-600 text-white text-xs font-bold px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-[60]">
          <CheckCircle2 size={14} className="text-violet-400" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
