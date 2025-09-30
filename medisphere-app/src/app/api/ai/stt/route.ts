// app/api/ai/stt/route.ts
import { NextResponse } from "next/server";
import speech from "@google-cloud/speech";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new speech.SpeechClient();

export async function POST(req: Request) {
  try {
    const { audioBase64, mimeType = "audio/webm" } = await req.json();
    if (!audioBase64) {
      return NextResponse.json({ error: "Missing audio base64" }, { status: 400 });
    }

    // Google Speech supports WEBM_OPUS/OGG_OPUS; configure accordingly
    const [response] = await client.recognize({
      audio: { content: audioBase64 },
      config: {
        encoding: "WEBM_OPUS" as any,
        languageCode: "en-US",
      },
    });

    const transcription =
      response.results?.map((r) => r.alternatives?.[0]?.transcript).join("\n") || "";

    return NextResponse.json({ text: transcription });
  } catch (err) {
    console.error("STT error:", err);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
