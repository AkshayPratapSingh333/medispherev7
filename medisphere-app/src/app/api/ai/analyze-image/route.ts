// app/api/ai/analyze-image/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash";
const FALLBACK_IMAGE_MODELS = ["gemini-1.5-pro", "gemini-2.0-flash"];

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ error: "Missing GEMINI_API_KEY / GOOGLE_API_KEY" }, { status: 500 });

  try {
    const { imageBase64, mimeType = "image/png" } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "Missing image data" }, { status: 400 });

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const modelCandidates = Array.from(new Set([IMAGE_MODEL, ...FALLBACK_IMAGE_MODELS]));

    const prompt =
      "You are a medical education assistant. Analyze this image cautiously. Describe notable findings in plain language, avoid diagnosis, and suggest what a clinician might focus on. Keep it concise.";

    let analysisResult = "";
    let lastError: unknown;
    let selectedModel = IMAGE_MODEL;

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
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

        analysisResult = result.response?.text() || "[No analysis]";
        selectedModel = modelName;
        break;
      } catch (error) {
        lastError = error;
        console.warn(`Image model ${modelName} failed, trying fallback...`);
        continue;
      }
    }

    if (!analysisResult) {
      console.error("All image analysis models failed:", lastError);
      return NextResponse.json(
        { error: "Image analysis failed", details: String(lastError) },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: analysisResult, model: selectedModel });
  } catch (err) {
    console.error("analyze-image error:", err);
    return NextResponse.json({ error: "Image analysis failed", details: String(err) }, { status: 500 });
  }
}
