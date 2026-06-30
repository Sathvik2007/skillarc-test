// app/dashboard/comms/page.tsx
"use client";
import { useState, useRef } from "react";
import { Mic, MicOff, BarChart2, MessageSquare, Download, RefreshCw } from "lucide-react";
import { Card, StatCard, SectionHeader, Badge } from "@/components/ui";
import { ApexBarChart } from "@/components/charts";

interface Metrics {
  wpm: number;
  fluency: number;
  clarity: number;
  fillerScore: number;
  proScore: number;
  structure: number;
  confidence: number;
  overall: number;
  emotion: string;
}

function analyse(text: string): Metrics {
  const words   = text.toLowerCase().split(/\s+/).filter(Boolean);
  const n       = words.length;
  if (n === 0) return { wpm:0,fluency:0,clarity:0,fillerScore:100,proScore:0,structure:0,confidence:0,overall:0,emotion:"Neutral" };

  const fillers     = ["um","uh","like","basically","actually","you know","right","so"];
  const proWords    = ["developed","implemented","designed","optimised","led","managed","deployed","achieved","analysed","collaborated"];
  const fillerCount = words.filter(w => fillers.includes(w)).length;
  const proCount    = words.filter(w => proWords.includes(w)).length;
  const sentences   = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const unique      = new Set(words).size;

  const wpm        = Math.round(n * 1.5);                      // simulated — no real audio
  const fluency    = Math.round((unique / n) * 100);
  const clarity    = Math.min(100, Math.round(n * 1.8));
  const fillerSc   = Math.max(0, 100 - fillerCount * 8);
  const proSc      = Math.min(100, proCount * 14);
  const structure  = Math.min(100, Math.round((n / Math.max(sentences, 1)) * 5));
  const confidence = Math.round((fluency * 0.5 + fillerSc * 0.3 + proSc * 0.2));

  // Simple sentiment
  const positive   = ["great","good","excellent","achieved","success","improved","strong"].filter(w => words.includes(w)).length;
  const negative   = ["failed","problem","issue","struggle","difficult","bad"].filter(w => words.includes(w)).length;
  const emotion    = positive > negative ? "Confident / Positive" : negative > positive ? "Hesitant / Negative" : "Neutral";

  const overall    = Math.round(
    fluency * 0.15 + fillerSc * 0.15 + clarity * 0.1 +
    structure * 0.1 + proSc * 0.15 + confidence * 0.15 +
    Math.min(100, wpm / 1.6) * 0.2
  );

  return { wpm, fluency, clarity, fillerScore: fillerSc, proScore: proSc, structure, confidence, overall, emotion };
}

export default function CommsPage() {
  const [text,     setText]   = useState("");
  const [metrics,  setMetrics]= useState<Metrics | null>(null);
  const [aiFb,     setAiFb]   = useState("");
  const [aiLoad,   setAiL]    = useState(false);
  const [recording,setRec]    = useState(false);
  const recognitionRef        = useRef<SpeechRecognition | null>(null);

  function runAnalysis() {
    if (!text.trim()) return;
    setMetrics(analyse(text));
    setAiFb("");
  }

  async function getAIFeedback() {
    if (!text.trim()) return;
    setAiL(true);
    const r = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `You are an expert HR interviewer and communication coach.

Evaluate this spoken response for a job interview:

"${text}"

Give structured feedback:
STRENGTHS (2-3 bullet points)
WEAKNESSES (2-3 bullet points)
SPECIFIC IMPROVEMENTS (3 actionable tips)
OVERALL VERDICT (1 sentence: Hire / Strong Hire / Needs Work / Not Ready)`,
      }),
    });
    const j = await r.json();
    setAiFb(j.text);
    setAiL(false);
  }

  function toggleRecording() {
    const SpeechRecognition = (window as Window & typeof globalThis & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition
      || (window as Window & typeof globalThis & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Please type your response instead.");
      return;
    }

    if (recording) {
      recognitionRef.current?.stop();
      setRec(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = "en-US";

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join(" ");
      setText(transcript);
    };

    recognition.onend  = () => setRec(false);
    recognition.onerror = () => setRec(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRec(true);
  }

  function downloadReport() {
    if (!metrics) return;
    const content = `COMMUNICATION ANALYSIS REPORT
==============================
Text analysed:
${text}

SCORES
------
Overall:       ${metrics.overall}%
Confidence:    ${metrics.confidence}%
Fluency:       ${metrics.fluency}%
Clarity:       ${metrics.clarity}%
Filler words:  ${metrics.fillerScore}%
Professional:  ${metrics.proScore}%
Structure:     ${metrics.structure}%
Speech pace:   ${metrics.wpm} WPM (simulated)
Emotion:       ${metrics.emotion}

AI FEEDBACK
-----------
${aiFb || "Not generated"}
`;
    const blob = new Blob([content], { type: "text/plain" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = "communication_report.txt";
    a.click();
  }

  const chartData = metrics ? [
    { metric: "Confidence",   score: metrics.confidence  },
    { metric: "Fluency",      score: metrics.fluency     },
    { metric: "Clarity",      score: metrics.clarity     },
    { metric: "Filler ctrl",  score: metrics.fillerScore },
    { metric: "Professional", score: metrics.proScore    },
    { metric: "Structure",    score: metrics.structure   },
  ] : [];

  return (
    <div className="space-y-5 max-w-4xl">
      <SectionHeader
        title="Communication Analyzer"
        subtitle="Evaluate your spoken interview responses"
        action={
          metrics && (
            <button className="btn-secondary" onClick={downloadReport}>
              <Download size={14}/> Download report
            </button>
          )
        }
      />

      {/* ── Input ────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-text-primary">Your response</p>
          <button
            onClick={toggleRecording}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              recording
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-background-border text-text-muted hover:text-text-secondary"
            }`}
          >
            {recording ? <><MicOff size={13}/> Stop recording</> : <><Mic size={13}/> Record</>}
          </button>
        </div>

        <textarea
          className="input h-36 resize-none"
          placeholder={recording
            ? "🔴 Listening… speak now"
            : "Type or record your interview response here.\n\nExample: 'Tell me about yourself' — try giving a 1-minute answer."
          }
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <div className="flex gap-2 mt-3">
          <button className="btn-primary flex-1" onClick={runAnalysis} disabled={!text.trim()}>
            <BarChart2 size={14}/> Analyse
          </button>
          {metrics && (
            <button className="btn-secondary" onClick={getAIFeedback} disabled={aiLoad}>
              <MessageSquare size={14}/> {aiLoad ? "Getting feedback…" : "AI feedback"}
            </button>
          )}
          <button className="btn-ghost" onClick={() => { setText(""); setMetrics(null); setAiFb(""); }}>
            <RefreshCw size={14}/>
          </button>
        </div>
      </Card>

      {/* ── Results ──────────────────────────────────────────────── */}
      {metrics && (
        <>
          {/* Overall score */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-background-card border border-background-border">
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f2d45" strokeWidth="3"/>
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={metrics.overall >= 75 ? "#22c55e" : metrics.overall >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="3"
                  strokeDasharray={`${metrics.overall} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-text-primary">
                {metrics.overall}
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">Overall score: {metrics.overall}%</p>
              <p className="text-sm text-text-secondary mt-0.5">
                {metrics.overall >= 80 ? "Excellent communication — interview-ready" :
                 metrics.overall >= 60 ? "Good — a few areas to polish" :
                 "Needs improvement — practice these areas"}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant={metrics.confidence >= 70 ? "success" : "warning"}>
                  Emotion: {metrics.emotion}
                </Badge>
                <Badge variant="neutral">{metrics.wpm} WPM</Badge>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Confidence",  value: metrics.confidence  },
              { label: "Fluency",     value: metrics.fluency     },
              { label: "Clarity",     value: metrics.clarity     },
              { label: "Filler ctrl", value: metrics.fillerScore },
              { label: "Professional",value: metrics.proScore    },
              { label: "Structure",   value: metrics.structure   },
            ].map(({ label, value }) => (
              <div key={label} className="metric-card card text-center">
                <p className="text-xs text-text-muted">{label}</p>
                <p className={`text-xl font-semibold mt-1 ${value >= 70 ? "text-success" : value >= 45 ? "text-accent-amber" : "text-danger"}`}>
                  {value}%
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <Card>
            <p className="text-sm font-medium text-text-primary mb-3">Score breakdown</p>
            <ApexBarChart data={chartData} dataKey="score" xKey="metric" color="#6366f1"/>
          </Card>

          {/* Actionable tips */}
          <Card>
            <p className="text-sm font-medium text-text-primary mb-3">Quick improvements</p>
            <div className="space-y-2">
              {metrics.fillerScore < 70 && (
                <div className="flex gap-2 p-2.5 rounded-lg bg-warning/5 border border-warning/20 text-sm text-warning">
                  <span>⚠</span> Reduce filler words — practice pausing instead of saying "um" or "like"
                </div>
              )}
              {metrics.wpm < 100 && (
                <div className="flex gap-2 p-2.5 rounded-lg bg-warning/5 border border-warning/20 text-sm text-warning">
                  <span>⚠</span> Speak slightly faster — aim for 120–150 WPM for confident delivery
                </div>
              )}
              {metrics.wpm > 180 && (
                <div className="flex gap-2 p-2.5 rounded-lg bg-warning/5 border border-warning/20 text-sm text-warning">
                  <span>⚠</span> Slow down — rushing reduces clarity and listener comprehension
                </div>
              )}
              {metrics.proScore < 40 && (
                <div className="flex gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary-text">
                  <span>💡</span> Use more action verbs — "developed", "achieved", "led" signal impact
                </div>
              )}
              {metrics.overall >= 75 && (
                <div className="flex gap-2 p-2.5 rounded-lg bg-success/5 border border-success/20 text-sm text-success">
                  <span>✓</span> Strong performance — focus on maintaining consistency under pressure
                </div>
              )}
            </div>
          </Card>

          {/* AI feedback */}
          {aiFb && (
            <Card className="border-primary/20">
              <p className="text-sm font-medium text-text-primary mb-3">AI HR Feedback</p>
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{aiFb}</div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
