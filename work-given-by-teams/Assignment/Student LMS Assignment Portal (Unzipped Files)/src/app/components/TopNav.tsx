import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { BookOpen, Calendar, Plus, User, CheckSquare, FileText, Library, Home, LogOut, ChevronDown, Bell, Megaphone, ClipboardList } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export function TopNav({ role, onJoinClass }: { role: "faculty" | "student"; onJoinClass?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setCreateModalOpen, notifications, markNotificationRead, classes } = useAppContext();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const isFaculty = role === "faculty";
  const homePath = isFaculty ? "/faculty" : "/student";
  const userName = isFaculty ? "Dr. Smith" : "Alex Johnson";
  
  const facultyLinks = [
    { name: "My Classes", path: "/faculty", icon: BookOpen },
    { name: "Global Calendar", path: "/faculty/calendar", icon: Calendar },
  ];

  const studentLinks = [
    { name: "My Classrooms", path: "/student", icon: Library },
    { name: "To-Do List/Deadlines", path: "/student/todo", icon: CheckSquare },
    { name: "My Report Card", path: "/student/report", icon: FileText },
  ];

  const links = isFaculty ? facultyLinks : studentLinks;

  const unreadNotifications = notifications.filter(n => !n.read);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Back to Portal Selection">
              <Home className="w-5 h-5" />
            </Link>

            <Link to={homePath} className="flex items-center gap-2 border-r border-gray-200 pr-6 mr-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 leading-tight text-lg">LearnConnect</span>
                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">{isFaculty ? "Faculty View" : "Student View"}</span>
              </div>
            </Link>

            <div className="hidden sm:flex sm:space-x-1">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <link.icon className="w-4 h-4 mr-2" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isFaculty && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadNotifications.length > 0 && (
                        <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-full">
                          {unreadNotifications.length} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">No notifications</div>
                      ) : (
                        notifications.map(n => {
                          const cls = classes.find(c => c.id === n.classId);
                          const isAnnouncement = n.type === 'announcement';
                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (!n.read) markNotificationRead(n.id);
                                if (n.classId) navigate(`/student/class/${n.classId}`);
                                setNotificationsOpen(false);
                              }}
                              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}
                            >
                              <div className="flex gap-3 items-start">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isAnnouncement ? 'bg-violet-100' : 'bg-indigo-100'}`}>
                                  {isAnnouncement
                                    ? <Megaphone className="w-4 h-4 text-violet-600" />
                                    : <ClipboardList className="w-4 h-4 text-indigo-600" />
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <h4 className={`text-sm leading-snug ${!n.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                      {n.title}
                                    </h4>
                                    {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1 ml-2"></span>}
                                  </div>
                                  {cls && (
                                    <p className="text-[10px] text-indigo-500 font-semibold mt-0.5 truncate">{cls.name}</p>
                                  )}
                                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(n.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={() => isFaculty ? setCreateModalOpen(true) : (onJoinClass ? onJoinClass() : undefined)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isFaculty ? "Create Class" : "Join Class"}
            </button>
            
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="hidden md:flex flex-col items-start text-sm">
                  <span className="font-semibold text-gray-700 leading-tight">{userName}</span>
                  <span className="text-xs text-gray-500 capitalize">{role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500 capitalize">{role}</p>
                  </div>
                  <button 
                    onClick={() => navigate("/")}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
