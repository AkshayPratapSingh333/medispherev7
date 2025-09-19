import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { query, patientId } = await req.json();
  // In production: retrieval from Pinecone and call to Gemini / LLM here.
  return NextResponse.json({ answer: `AI placeholder: received "${query}"` });
}
