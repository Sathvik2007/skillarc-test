// app/api/students/[id]/route.ts — MOCK version (no Supabase)
import { NextResponse } from "next/server";
import { MOCK_STUDENTS } from "@/lib/mock-data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = MOCK_STUDENTS.find(s => s.student_id === id);

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Build mock semester data
  const semesters = Object.entries(student.sgpa).map(([key, sgpa]) => {
    const sem = parseInt(key.replace("sem",""));
    return {
      student_id: id,
      semester: sem,
      sgpa,
      backlogs: (student.backlogs as any)[key] ?? 0,
      attendance: (student.attendance as any)[key] ?? 85,
    };
  });

  // Mock subject marks
  const subjectsBySem: Record<string, string[]> = {
    sem1: ["Engineering Mathematics-I","Engineering Physics","Engineering Chemistry","Programming in C","English"],
    sem2: ["Engineering Mathematics-II","Engineering Mechanics","Basic Electrical Engineering","Data Structures","Workshop Practice"],
    sem3: ["Discrete Mathematics","OOP with Java","Digital Electronics","Computer Organization","Probability & Statistics"],
    sem4: ["Design & Analysis of Algorithms","Operating Systems","DBMS","Computer Networks","Software Engineering"],
    sem5: ["Theory of Computation","Compiler Design","Distributed Systems","Elective-I","Elective-II"],
    sem6: ["Machine Learning","Cloud Computing","Information Security","Elective-III","Project-I"],
    sem7: ["Deep Learning","Big Data Analytics","Elective-IV","Elective-V","Project-II"],
    sem8: ["Industry Internship","Capstone Project","Open Elective","Professional Ethics"],
  };

  const subjects = Object.entries(subjectsBySem).flatMap(([sem, subjectList]) =>
    subjectList.map((subject, i) => ({
      student_id: id,
      semester: parseInt(sem.replace("sem","")),
      subject,
      marks: Math.min(100, 55 + ((student.sgpa as any)[sem] * 5 + i * 3) % 40),
      grade: (student.sgpa as any)[sem] >= 9 ? "O" : (student.sgpa as any)[sem] >= 8 ? "A+" : (student.sgpa as any)[sem] >= 7 ? "A" : "B+",
    }))
  );

  return NextResponse.json({ data: { ...student, semesters, subjects } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const idx = MOCK_STUDENTS.findIndex(s => s.student_id === id);

  if (idx === -1) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // In mock mode we just reflect the update back (in-memory only, resets on restart)
  const updated = { ...MOCK_STUDENTS[idx], ...body };
  MOCK_STUDENTS[idx] = updated;
  return NextResponse.json({ data: updated });
}
