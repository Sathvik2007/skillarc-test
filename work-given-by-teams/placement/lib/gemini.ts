// lib/gemini.ts — Gemini AI helper
// Set GEMINI_API_KEY in .env.local for real responses; omit for mock mode.
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return "[Mock AI] No GEMINI_API_KEY set. Add it to .env.local for real AI responses.";
  }

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    next:    { revalidate: 0 },
  });

  if (!res.ok) return `Gemini error: ${res.status}`;
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response";
}
