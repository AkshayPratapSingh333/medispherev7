import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const PINECONE_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX = process.env.PINECONE_INDEX || "telemed-ai";

const pinecone = new Pinecone({ apiKey: PINECONE_KEY });

export async function runAIChat(messages: { role: string; content: string }[], language = "en") {
  const lastMessage = messages[messages.length - 1]?.content || "";

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: GEMINI_KEY,
    model: "embedding-001",
  });

  const index = pinecone.index(PINECONE_INDEX);
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex: index });

  const results = await vectorStore.similaritySearch(lastMessage, 3);
  const context = results.map(r => r.pageContent).join("\n");

  const model = new ChatGoogleGenerativeAI({
    apiKey: GEMINI_KEY,
    model: "gemini-pro",
    temperature: 0.4,
  });

  const prompt = `
  You are a helpful medical assistant. 
  Always suggest consulting a real doctor.
  Answer in ${language}.
  Context:
  ${context}

  User: ${lastMessage}
  `;

  const response = await model.invoke([
    { role: "system", content: "You are a medical AI assistant." },
    { role: "user", content: prompt },
  ]);

  // ✅ Handle both string and structured content
  if (typeof response.content === "string") {
    return response.content;
  }
  if (Array.isArray(response.content)) {
    return response.content.map(c => ("text" in c ? c.text : "")).join(" ");
  }

  return "[No response]";
}
