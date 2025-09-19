import { NextResponse } from "next/server";
import speech from "@google-cloud/speech";

const client = new speech.SpeechClient();

export async function POST(req: Request) {
  const { audioBase64 } = await req.json();

  const [response] = await client.recognize({
    audio: { content: audioBase64 },
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "en-US",
    },
  });

  const transcription = response.results
    ?.map(r => r.alternatives?.[0]?.transcript)
    .join("\n");

  return NextResponse.json({ text: transcription || "" });
}
