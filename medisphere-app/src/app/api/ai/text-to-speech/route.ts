import { NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";

const client = new textToSpeech.TextToSpeechClient();

export async function POST(req: Request) {
  const { text, languageCode = "en-US", voiceName = "en-US-Wavenet-D" } =
    await req.json();

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode, name: voiceName },
    audioConfig: { audioEncoding: "MP3" },
  });

  return NextResponse.json({
    audioContent: response.audioContent?.toString("base64"),
  });
}
