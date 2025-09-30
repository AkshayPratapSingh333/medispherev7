// app/api/ai/analyze-image/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

  try {
    const { imageBase64, mimeType = "image/png" } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "Missing image data" }, { status: 400 });

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt =
      "You are a medical education assistant. Analyze this image cautiously. Describe notable findings in plain language, avoid diagnosis, and suggest what a clinician might focus on. Keep it concise.";

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: imageBase64 } },
          ],
        },
      ],
    });

    const text = result.response?.text() || "[No analysis]";
    return NextResponse.json({ result: text });
  } catch (err) {
    console.error("analyze-image error:", err);
    return NextResponse.json({ error: "Image analysis failed" }, { status: 500 });
  }
}
