// app/api/ai/chat/route.ts — MOCK version (no Gemini API key needed)
import { NextResponse } from "next/server";

// If GEMINI_API_KEY is set, use real Gemini; otherwise return a canned mock response.
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: "No prompt" }, { status: 400 });

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    // Mock AI response
    return NextResponse.json({
      text: `[AI Mock] Based on the placement data: CSE branch typically leads with the highest placement rate (~78%), followed by IT (~72%). Average packages range from ₹6.5 LPA (service companies) to ₹40+ LPA (top tech). Top recruiters are TCS, Infosys, and Accenture by volume, while Google and Microsoft offer the highest CTCs. To get a real AI response, add GEMINI_API_KEY to your .env.local file.`,
    });
  }

  try {
    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("[ai/chat]", err);
    return NextResponse.json({ text: "AI service unavailable. Check GEMINI_API_KEY." });
  }
}
