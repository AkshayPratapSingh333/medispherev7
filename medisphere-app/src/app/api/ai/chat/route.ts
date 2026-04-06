// app/api/ai/chat/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const PREFERRED_CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash";
const FALLBACK_CHAT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
];

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  try {
    const { messages, documents = [], images = [] } = await req.json();

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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

    const modelCandidates = Array.from(new Set([PREFERRED_CHAT_MODEL, ...FALLBACK_CHAT_MODELS]));
    let selectedModel = PREFERRED_CHAT_MODEL;
    let responseText = "";
    let lastError: unknown;

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({ contents });
        responseText =
          result.response?.text() || "I apologize, but I couldn't generate a response.";
        selectedModel = modelName;
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;

        // If this model hit quota/rate limits, try the next fallback model.
        if (isQuotaOrRateLimitError(error)) {
          console.warn(`AI model ${modelName} quota/rate-limited, trying fallback model.`);
          continue;
        }

        // If this model does not exist or doesn't support generateContent, try next model.
        if (isModelUnavailableError(error)) {
          console.warn(`AI model ${modelName} unavailable/unsupported, trying fallback model.`);
          continue;
        }

        throw error;
      }
    }

    if (!responseText) {
      if (isQuotaOrRateLimitError(lastError)) {
        const retryAfterSeconds = getRetryAfterSeconds(lastError);
        const headers = retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : undefined;

        return NextResponse.json(
          {
            error: "AI quota exceeded",
            response:
              "AI service is temporarily unavailable due to API quota limits. Please retry in about a minute, or update your Gemini API billing/quota settings.",
            retryAfterSeconds,
          },
          { status: 429, headers }
        );
      }

      if (isModelUnavailableError(lastError)) {
        return NextResponse.json(
          {
            error: "No compatible AI model available",
            response:
              "AI chat is temporarily unavailable because the configured Gemini model is not available for this API version/project. Please set GEMINI_CHAT_MODEL to a model that supports generateContent.",
            attemptedModels: modelCandidates,
          },
          { status: 503 }
        );
      }

      throw lastError || new Error("Failed to generate chat response");
    }

    return NextResponse.json({ response: responseText, model: selectedModel });
  } catch (err) {
    console.error("Chat error:", err);

    if (isQuotaOrRateLimitError(err)) {
      const retryAfterSeconds = getRetryAfterSeconds(err);
      const headers = retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : undefined;

      return NextResponse.json(
        {
          error: "AI quota exceeded",
          response:
            "AI service is temporarily unavailable due to API quota limits. Please retry shortly, or update your Gemini API billing/quota settings.",
          retryAfterSeconds,
        },
        { status: 429, headers }
      );
    }

    if (isModelUnavailableError(err)) {
      return NextResponse.json(
        {
          error: "No compatible AI model available",
          response:
            "AI chat is temporarily unavailable because the configured Gemini model is not available for this API version/project. Update GEMINI_CHAT_MODEL and retry.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process chat request",
        response:
          "I hit a temporary server issue while processing your request. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}

function isQuotaOrRateLimitError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;

  const maybeErr = err as {
    status?: number;
    message?: string;
    errorDetails?: Array<{ violations?: Array<{ quotaMetric?: string; quotaId?: string }> }>;
  };

  if (maybeErr.status === 429) return true;

  const message = (maybeErr.message || "").toLowerCase();
  if (message.includes("quota") || message.includes("rate limit") || message.includes("too many requests")) {
    return true;
  }

  const details = maybeErr.errorDetails || [];
  return details.some((detail) =>
    (detail.violations || []).some((v) => {
      const metric = (v.quotaMetric || "").toLowerCase();
      const id = (v.quotaId || "").toLowerCase();
      return metric.includes("quota") || metric.includes("requests") || id.includes("quota") || id.includes("requests");
    })
  );
}

function getRetryAfterSeconds(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;

  const maybeErr = err as {
    message?: string;
    errorDetails?: Array<{ retryDelay?: string }>;
  };

  const fromDetails = (maybeErr.errorDetails || [])
    .map((d) => d.retryDelay)
    .find((v): v is string => typeof v === "string" && v.endsWith("s"));

  if (fromDetails) {
    const secs = Number(fromDetails.replace("s", ""));
    return Number.isFinite(secs) && secs > 0 ? Math.ceil(secs) : undefined;
  }

  const message = maybeErr.message || "";
  const match = message.match(/retry in\s+([0-9]+(?:\.[0-9]+)?)s?/i);
  if (!match) return undefined;

  const secs = Number(match[1]);
  return Number.isFinite(secs) && secs > 0 ? Math.ceil(secs) : undefined;
}

function isModelUnavailableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;

  const maybeErr = err as {
    status?: number;
    statusText?: string;
    message?: string;
  };

  if (maybeErr.status === 404) return true;

  const statusText = (maybeErr.statusText || "").toLowerCase();
  if (statusText.includes("not found")) return true;

  const message = (maybeErr.message || "").toLowerCase();
  return (
    message.includes("not found for api version") ||
    message.includes("is not supported for generatecontent") ||
    message.includes("call listmodels")
  );
}