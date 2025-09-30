// app/api/ai/tts/route.ts
import { NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new textToSpeech.TextToSpeechClient();

export async function POST(req: Request) {
  try {
    const { text, languageCode = "en-US", voiceName = "en-US-Wavenet-D" } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode, name: voiceName },
      audioConfig: { audioEncoding: "MP3" },
    });

    return NextResponse.json({
      audioContent: response.audioContent?.toString("base64"),
    });
  } catch (err) {
    console.error("TTS error:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
