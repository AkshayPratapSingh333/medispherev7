// app/api/ai/chat/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  try {
    const { messages, documents = [], images = [] } = await req.json();

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Build context from documents
    let contextPrompt = "";
    if (documents.length > 0) {
      contextPrompt += "\n\n## Available Documents:\n";
      documents.forEach((doc: { name: string; content: string }) => {
        contextPrompt += `\n### Document: ${doc.name}\n${doc.content}\n`;
      });
      contextPrompt += "\n---\n";
    }

    // Build system prompt
    const systemPrompt = `You are a helpful AI assistant specialized in medical education and general knowledge.

${contextPrompt}

Guidelines:
- If documents are provided, use them to answer questions accurately
- For medical images, provide educational analysis but avoid diagnoses
- Be clear, concise, and helpful
- If you don't know something, say so
- Always cite which document you're referencing when using document context
- For medical content, always include appropriate disclaimers

Important: This is for educational purposes only and does not replace professional medical advice.`;

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Add system prompt as first message
    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I'll assist with questions about the documents, images, and general queries while following the guidelines." }],
      },
      ...geminiMessages,
    ];

    // Add images to the last user message if present
    if (images.length > 0 && contents.length > 0) {
      const lastUserMsgIndex = contents.length - 1;
      const imageParts = images.map((img: { base64: string; mimeType: string; name: string }) => ({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64,
        },
      }));

      // Add image context
      contents[lastUserMsgIndex].parts.unshift({
        text: `[Context: ${images.length} image(s) uploaded: ${images.map((i: any) => i.name).join(", ")}]`,
      });
      
      contents[lastUserMsgIndex].parts.push(...imageParts);
    }

    const result = await model.generateContent({ contents });
    const response = result.response?.text() || "I apologize, but I couldn't generate a response.";

    return NextResponse.json({ response });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}