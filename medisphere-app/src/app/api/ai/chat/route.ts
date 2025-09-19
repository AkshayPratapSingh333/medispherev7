import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const PINECONE_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX = process.env.PINECONE_INDEX || "telemed-ai";

export async function POST(req: Request) {
  const { messages, language = "en" } = await req.json();
  const lastMessage = messages?.[messages.length - 1]?.content || "";

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: GEMINI_KEY,
    model: "embedding-001",
  });

  const pinecone = new Pinecone({ apiKey: PINECONE_KEY });
  const index = pinecone.index(PINECONE_INDEX);
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
  });

  const results = await vectorStore.similaritySearch(lastMessage, 3);
  const context = results.map(r => r.pageContent).join("\n");

  const model = new ChatGoogleGenerativeAI({
    apiKey: GEMINI_KEY,
    model: "gemini-pro",
    temperature: 0.4,
  });

  const response = await model.invoke([
    {
      role: "user",
      content: `Answer in ${language}. Use verified medical context:\n${context}\n\nQuestion: ${lastMessage}`,
    },
  ]);

  let reply = "";
  if (typeof response.content === "string") {
    reply = response.content;
  } else if (Array.isArray(response.content)) {
    reply = response.content.map(c => ("text" in c ? c.text : "")).join(" ");
  }

  return NextResponse.json({ response: reply || "[No reply]" });
}
