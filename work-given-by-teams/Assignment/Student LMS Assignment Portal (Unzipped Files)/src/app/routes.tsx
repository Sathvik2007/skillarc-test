import { createBrowserRouter, Navigate } from "react-router";
import { PortalEntry } from "./pages/PortalEntry";
import { FacultyDashboard } from "./pages/FacultyDashboard";
import { FacultyClassHub } from "./pages/FacultyClassHub";
import { EvaluationPortal } from "./pages/EvaluationPortal";
import { FacultyCalendar } from "./pages/FacultyCalendar";
import { StudentDashboard } from "./pages/StudentDashboard";
import { StudentClassHub } from "./pages/StudentClassHub";
import { StudentAssignment } from "./pages/StudentAssignment";
import { StudentTodo } from "./pages/StudentTodo";
import { StudentReportCard } from "./pages/StudentReportCard";

export const router = createBrowserRouter([
  { path: "/", Component: PortalEntry },
  { path: "/faculty", Component: FacultyDashboard },
  { path: "/faculty/calendar", Component: FacultyCalendar },
  { path: "/faculty/analytics", Component: () => <Navigate to="/faculty" /> },
  { path: "/faculty/class/:classId", Component: FacultyClassHub },
  { path: "/faculty/evaluation/:assignmentId", Component: EvaluationPortal },
  { path: "/student", Component: StudentDashboard },
  { path: "/student/todo", Component: StudentTodo },
  { path: "/student/report", Component: StudentReportCard },
  { path: "/student/class/:classId", Component: StudentClassHub },
  { path: "/student/assignment/:assignmentId", Component: StudentAssignment },
]);
