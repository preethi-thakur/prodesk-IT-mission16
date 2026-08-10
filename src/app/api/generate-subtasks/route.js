import { NextResponse } from "next/server";

const getSubtasks = (content) => {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.subtasks;
  } catch {
    return content.split("\n").map((item) => item.replace(/^\s*(?:[-*]|\d+[.)])\s*/, "").trim());
  }
};

export async function POST(request) {
  const { title, description } = await request.json();

  if (!title?.trim() || !description?.trim()) {
    return NextResponse.json({ message: "A task title and description are required." }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ message: "Groq is not configured. Add GROQ_API_KEY to your environment." }, { status: 500 });
  }

  let response;

  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.4,
        messages: [
          { role: "system", content: "Return exactly five concise, actionable subtasks as a JSON array of strings. Do not include markdown or any other text." },
          { role: "user", content: `Task title: ${title.trim()}\nTask description: ${description.trim()}` },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return NextResponse.json({ message: "The AI service did not respond. Check your connection and try again." }, { status: 504 });
  }

  if (!response.ok) {
    return NextResponse.json({ message: "Unable to generate subtasks right now." }, { status: response.status });
  }

  const data = await response.json();
  const subtasks = getSubtasks(data.choices?.[0]?.message?.content ?? "").filter((item) => typeof item === "string" && item.trim()).slice(0, 5);

  if (subtasks.length !== 5) {
    return NextResponse.json({ message: "Unable to generate five subtasks. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ subtasks });
}
