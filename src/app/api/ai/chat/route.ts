// src/app/api/ai/chat/route.ts — AI endpoint for Placements and Interviews

import { NextResponse } from "next/server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "No prompt provided" }, { status: 400 });

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Premium Mock AI response that answers realistically based on context
      let text = "[AI Mock Response] To enable live responses, configure GEMINI_API_KEY in .env.local.\n\n";
      
      const lower = prompt.toLowerCase();
      if (lower.includes("which branch") || lower.includes("branch")) {
        text += "Currently, Computer Science Engineering (CSE) and AI & Data Science (AI & DS) lead the placement shares at 32% and 28% respectively. CSE has the highest overall average package at ₹12.4 LPA, with Swiggy, Amazon, and Google hiring heavily from this discipline.";
      } else if (lower.includes("company") || lower.includes("recruiter")) {
        text += "Accenture and TCS represent the largest hiring volume this year, with 42 and 30 placements respectively. Google and Microsoft represent the highest CTC packages at ₹45 LPA and ₹40 LPA, having hired 4 and 7 students.";
      } else if (lower.includes("interview question") || lower.includes("interviewer")) {
        text += "Design a rate limiter for an API endpoint. Explain the algorithms you would consider (e.g. Token Bucket, Leaking Bucket, Sliding Window Log) and compare their space/time complexities. How would you handle distributed rate limiting using Redis?";
      } else if (lower.includes("spoken response") || lower.includes("spoken") || lower.includes("hr")) {
        text += `STRENGTHS:
- Solid structuring of the response.
- Clear articulation of technical experiences.

WEAKNESSES:
- Minor overuse of filler words.
- Could emphasize the quantitative impact of your work (e.g. percentages, load reduction).

SPECIFIC IMPROVEMENTS:
1. Try to replace pauses with silent beats instead of saying 'like' or 'basically'.
2. Use strong action verbs like 'Architected' or 'Spearheaded' to start your sentences.
3. Mention the exact metric improvements from your project.

OVERALL VERDICT:
Strong Hire. The candidate demonstrates strong foundational logic and confidence.`;
      } else {
        text += "Analysis: Placement trends indicate a 14% growth in average package size (reaching ₹12.5 LPA) compared to the previous cycle. Hiring demand is heavily concentrated in cloud computing, data engineering, and full-stack development, with FinTech and AI companies constituting 45% of total job offers.";
      }

      return NextResponse.json({ text });
    }

    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!res.ok) {
      console.error("Gemini response error status:", res.status);
      return NextResponse.json({ text: `AI service returned error: ${res.status}` });
    }

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response generated";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("[ai/chat API Error]", err);
    return NextResponse.json({ text: "AI service is currently unavailable. Please verify API configuration." });
  }
}
