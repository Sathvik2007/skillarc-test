// app/dashboard/interview/page.tsx
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Video, VideoOff, Send, RotateCcw, FileText, ChevronRight, AlertTriangle } from "lucide-react";
import { Card, Badge, SectionHeader } from "@/components/ui";

type Phase = "config" | "active" | "report";
type Difficulty = "Entry" | "Mid" | "Senior";

interface LogEntry { question: string; answer: string; feedback: string; score: number; }

export default function InterviewPage() {
  const [phase,      setPhase]    = useState<Phase>("config");
  const [role,       setRole]     = useState("Software Engineer");
  const [difficulty, setDiff]     = useState<Difficulty>("Entry");
  const [question,   setQuestion] = useState("");
  const [answer,     setAnswer]   = useState("");
  const [logs,       setLogs]     = useState<LogEntry[]>([]);
  const [feedback,   setFeedback] = useState("");
  const [report,     setReport]   = useState("");
  const [warnings,   setWarnings] = useState(0);
  const [elapsed,    setElapsed]  = useState(0);
  const [loading,    setLoad]     = useState(false);
  const [camOn,      setCamOn]    = useState(false);
  const [faceStatus, setFaceStatus] = useState("Waiting for camera…");
  const [resume,     setResume]   = useState("");

  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef  = useRef<NodeJS.Timeout>();
  const startTime = useRef<number>(0);

  // Timer
  useEffect(() => {
    if (phase === "active") {
      startTime.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamOn(true);
      setFaceStatus("Camera active — monitoring…");
    } catch {
      setFaceStatus("Camera unavailable");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCamOn(false);
    setFaceStatus("Camera off");
  }, []);

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

  async function callAI(prompt: string): Promise<string> {
    const r = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    return (await r.json()).text ?? "";
  }

  async function startInterview() {
    setLoad(true);
    const q = await callAI(
      `You are a FAANG-level interviewer.\nRole: ${role}\nLevel: ${difficulty}\n${resume ? `Resume context: ${resume.slice(0, 400)}` : ""}\nAsk ONE real-world technical interview question. Return ONLY the question.`
    );
    setQuestion(q);
    setPhase("active");
    startCamera();
    setLoad(false);
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    setLoad(true);
    const fb = await callAI(
      `Interview Question: ${question}\nCandidate Answer: ${answer}\n\nEvaluate strictly:\nScore: X/10\nStrengths:\nWeaknesses:\nVerdict:`
    );
    const scoreMatch = fb.match(/(\d+)\/10/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

    const entry: LogEntry = { question, answer, feedback: fb, score };
    setLogs(p => [...p, entry]);
    setFeedback(fb);

    // Adaptive difficulty
    setDiff(score >= 8 ? "Senior" : score >= 5 ? "Mid" : "Entry");
    setLoad(false);
  }

  async function nextQuestion() {
    setLoad(true);
    setFeedback("");
    const q = await callAI(
      `Previous: ${question}\nAnswer quality: ${difficulty}\nAsk the NEXT interview question for ${role} at ${difficulty} level. Return ONLY the question.`
    );
    setQuestion(q);
    setAnswer("");
    setLoad(false);
  }

  async function endInterview() {
    setLoad(true);
    stopCamera();
    const r = await callAI(
      `Interview completed.\nRole: ${role}\nLogs:\n${logs.map((l, i) => `Q${i+1}: ${l.question}\nA: ${l.answer}\nScore: ${l.score}/10`).join("\n\n")}\n\nGenerate a comprehensive final report:\n- Overall score /10\n- Key strengths\n- Areas to improve\n- Hiring recommendation\n- Study plan for next 30 days`
    );
    setReport(r);
    setPhase("report");
    setLoad(false);
  }

  function resetInterview() {
    setPhase("config"); setLogs([]); setQuestion(""); setAnswer("");
    setFeedback(""); setReport(""); setWarnings(0); setElapsed(0); setDiff("Entry");
  }

  function formatTime(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2,"0")}:${(s % 60).toString().padStart(2,"0")}`;
  }

  const avgScore = logs.length ? Math.round(logs.reduce((a,l) => a + l.score, 0) / logs.length) : 0;

  // ── CONFIG ──────────────────────────────────────────────────────────────────
  if (phase === "config") return (
    <div className="space-y-5 max-w-xl">
      <SectionHeader title="Mock Interview" subtitle="AI-powered adaptive interview terminal"/>

      <Card className="space-y-4">
        <div>
          <label className="label">Target role</label>
          <select className="input" value={role} onChange={e => setRole(e.target.value)}>
            {["Software Engineer","AI/ML Engineer","Data Engineer","Cloud Engineer","Cyber Security","Full Stack Developer","DevOps Engineer"].map(r=><option key={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Starting difficulty</label>
          <div className="flex gap-2">
            {(["Entry","Mid","Senior"] as Difficulty[]).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDiff(d)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  difficulty === d
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-background-border text-text-muted hover:text-text-secondary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Resume context (optional)</label>
          <textarea
            className="input h-24 resize-none"
            placeholder="Paste key points from your resume — skills, projects, experience…"
            value={resume}
            onChange={e => setResume(e.target.value)}
          />
        </div>

        <button className="btn-primary w-full" onClick={startInterview} disabled={loading}>
          {loading ? "Preparing interview…" : "Start Interview"}
        </button>
      </Card>

      <Card>
        <p className="text-sm font-medium text-text-primary mb-2">How it works</p>
        <ol className="space-y-2 text-sm text-text-secondary">
          {["AI generates role-specific questions",
            "Your answer is scored in real time",
            "Difficulty adapts — score well, get harder questions",
            "Camera monitors for fraud (optional)",
            "Final report with study plan at the end"].map((s,i)=>(
            <li key={i} className="flex gap-2"><span className="text-primary font-medium">{i+1}.</span>{s}</li>
          ))}
        </ol>
      </Card>
    </div>
  );

  // ── REPORT ──────────────────────────────────────────────────────────────────
  if (phase === "report") return (
    <div className="space-y-5 max-w-2xl">
      <SectionHeader
        title="Interview Report"
        action={
          <button className="btn-secondary" onClick={resetInterview}>
            <RotateCcw size={14}/> New interview
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="metric-card card text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider">Questions</p>
          <p className="text-3xl font-semibold text-text-primary mt-1">{logs.length}</p>
        </div>
        <div className="metric-card card text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider">Avg score</p>
          <p className={`text-3xl font-semibold mt-1 ${avgScore >= 7 ? "text-success" : avgScore >= 5 ? "text-accent-amber" : "text-danger"}`}>
            {avgScore}/10
          </p>
        </div>
        <div className="metric-card card text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider">Duration</p>
          <p className="text-3xl font-semibold text-text-primary mt-1">{formatTime(elapsed)}</p>
        </div>
      </div>

      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">AI performance report</p>
        <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{report}</div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">Question log</p>
        <div className="space-y-3">
          {logs.map((l, i) => (
            <div key={i} className="p-3 rounded-lg bg-background-muted border border-background-border">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-text-primary">Q{i+1}: {l.question}</p>
                <Badge variant={l.score >= 7 ? "success" : l.score >= 5 ? "warning" : "danger"}>
                  {l.score}/10
                </Badge>
              </div>
              <p className="text-xs text-text-muted">{l.answer.slice(0, 120)}{l.answer.length > 120 ? "…" : ""}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ── ACTIVE INTERVIEW ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 max-w-5xl">
      {/* ── Status bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-background-card border border-background-border">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-text-muted">{formatTime(elapsed)}</span>
          <Badge variant={difficulty === "Senior" ? "danger" : difficulty === "Mid" ? "warning" : "success"}>
            {difficulty}
          </Badge>
          <span className="text-xs text-text-muted">{logs.length} answered</span>
          {avgScore > 0 && <span className="text-xs text-text-muted">Avg: {avgScore}/10</span>}
        </div>
        <div className="flex gap-2">
          {warnings > 0 && (
            <div className="flex items-center gap-1 text-xs text-warning">
              <AlertTriangle size={12}/> {warnings} warning{warnings > 1 ? "s" : ""}
            </div>
          )}
          <button className="btn-secondary text-xs py-1 px-2" onClick={endInterview}>
            <FileText size={13}/> End & report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Question + answer ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Question</p>
            <p className="text-text-primary leading-relaxed">{question}</p>
          </Card>

          <Card>
            <label className="label">Your answer</label>
            <textarea
              className="input h-40 resize-none font-mono text-sm"
              placeholder="Type your answer here… you can write code, explain concepts, describe your approach…"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <button
                className="btn-primary flex-1"
                onClick={submitAnswer}
                disabled={loading || !answer.trim()}
              >
                <Send size={14}/> {loading ? "Evaluating…" : "Submit answer"}
              </button>
              {logs.length > 0 && (
                <button className="btn-secondary" onClick={nextQuestion} disabled={loading}>
                  <ChevronRight size={14}/> Next
                </button>
              )}
            </div>
          </Card>

          {/* Feedback */}
          {feedback && (
            <Card className="border-primary/20">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">AI Feedback</p>
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {feedback}
              </div>
              <button className="btn-primary mt-3 w-full" onClick={nextQuestion} disabled={loading}>
                <ChevronRight size={14}/> Next question
              </button>
            </Card>
          )}
        </div>

        {/* ── Camera panel ──────────────────────────────────────── */}
        <div className="space-y-3">
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-text-secondary">Proctoring</p>
              <button
                className={camOn ? "btn-ghost p-1 text-danger" : "btn-secondary py-1 px-2 text-xs"}
                onClick={camOn ? stopCamera : startCamera}
              >
                {camOn ? <VideoOff size={13}/> : <><Video size={13}/> Enable</>}
              </button>
            </div>

            <div className="aspect-video bg-background-muted rounded-lg overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${camOn ? "" : "hidden"}`}
              />
              {!camOn && <Video size={28} className="text-text-muted"/>}
            </div>

            <p className="text-xs text-text-muted mt-2">{faceStatus}</p>

            {warnings > 0 && (
              <div className="mt-2 p-2 rounded bg-warning/10 border border-warning/20 text-xs text-warning flex gap-1">
                <AlertTriangle size={12} className="shrink-0 mt-0.5"/>
                {warnings >= 3 ? "Max warnings reached" : `${warnings}/3 warnings`}
              </div>
            )}
          </Card>

          {/* Progress */}
          <Card className="p-3">
            <p className="text-xs text-text-muted mb-2">Session progress</p>
            <div className="space-y-2">
              <div className="h-1.5 bg-background-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(logs.length * 20, 100)}%` }}
                />
              </div>
              <p className="text-xs text-text-muted">{logs.length} / 5 questions completed</p>
            </div>

            {logs.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {logs.map((l, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Q{i+1}</span>
                    <div className="flex-1 mx-2 h-1 bg-background-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${l.score >= 7 ? "bg-success" : l.score >= 5 ? "bg-accent-amber" : "bg-danger"}`}
                        style={{ width: `${l.score * 10}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-text-secondary">{l.score}/10</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
