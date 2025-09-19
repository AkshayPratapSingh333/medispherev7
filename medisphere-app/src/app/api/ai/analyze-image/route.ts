import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Gemini Vision expects content with parts array: [ { text }, { inlineData } ]
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: "You are a medical AI. Analyze this image and summarize findings:" },
            {
              inlineData: {
                mimeType: "image/png", // adjust if jpg/jpeg
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const text = result.response.text();

    return NextResponse.json({ result: text || "[No analysis]" });
  } catch (err) {
    console.error("analyze-image error:", err);
    return NextResponse.json(
      { error: "Image analysis failed" },
      { status: 500 }
    );
  }
}
