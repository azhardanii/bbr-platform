import { GoogleGenAI } from "@google/genai";

// Model constants mapped strictly to available models with quota optimization
export const MODELS = {
  // Heavy reasoning & Academic Depth (Skripsi/Tesis Reasoning, Perluas, Sidang, Bab Analysis)
  ACADEMIC_DEEP: "gemini-3.7-flash",
  
  // High quality academic text generation & restructuring (Parafrase, Analisis Kritis)
  ACADEMIC_PARAPHRASE: "gemini-3.5-flash",
  
  // Fast, accurate & high-quota (500/day) for syntactic checking, EYD, typo, and summarization
  FAST_LIGHT: "gemini-3.5-flash-lite",
  FAST_LITE_FALLBACK: "gemini-3.1-flash-lite",
  
  // Legacy aliases for compatibility across platform tools
  REASONING: "gemini-3.7-flash",
  CREATIVE: "gemini-3.5-flash",
  FAST: "gemini-3.5-flash-lite",
  EMBEDDING: "gemini-embedding-2",
} as const;

// Hierarchy of models for automatic fallback cascade
const MODEL_FALLBACK_CHAINS: Record<string, string[]> = {
  "gemini-3.7-flash": ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3-flash", "gemini-2-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
  "gemini-3.6-flash": ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3-flash", "gemini-2-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
  "gemini-3.5-flash": ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3-flash", "gemini-2-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
  "gemini-3-flash": ["gemini-3-flash", "gemini-3.5-flash", "gemini-2-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
  "gemini-2-flash": ["gemini-2-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
  "gemini-3.5-flash-lite": ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.5-flash"],
  "gemini-3.1-flash-lite": ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-3.5-flash"],
};

// Initialize the GoogleGenAI clients with primary & backup keys
const primaryAi = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const backupAi = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY_BACKUP || process.env.GOOGLE_GENAI_API_KEY,
});

// Save original interaction creators
const originalPrimaryCreate = primaryAi.interactions.create.bind(primaryAi.interactions);
const originalBackupCreate = backupAi.interactions.create.bind(backupAi.interactions);

// Robust Auto-fallback for API Keys and Model Cascades
const executeWithFallback = async (options: any) => {
  const isRetryableError = (err: any) => {
    const msg = (err?.message || "").toLowerCase();
    const status = err?.status || err?.statusCode;
    return (
      status === 429 ||
      status === 500 ||
      status === 503 ||
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("resource_exhausted") ||
      msg.includes("rate limit") ||
      msg.includes("deadline") ||
      msg.includes("overloaded")
    );
  };

  const requestedModel = options.model || MODELS.ACADEMIC_DEEP;
  const fallbackChain = MODEL_FALLBACK_CHAINS[requestedModel] || [requestedModel, "gemini-3.5-flash", "gemini-3.5-flash-lite"];

  let lastError: any = null;

  // Cascade through models: for each model, try API Key 1, then API Key 2
  for (const targetModel of fallbackChain) {
    const clients = [
      { createFn: originalPrimaryCreate, name: "Primary API Key (Key 1)" },
      { createFn: originalBackupCreate, name: "Backup API Key (Key 2)" },
    ];

    for (const client of clients) {
      try {
        if (targetModel !== requestedModel || client.name.includes("Key 2")) {
          console.warn(`[AI Engine] Attempting request using model: ${targetModel} via ${client.name}`);
        }

        const res = await client.createFn({ ...options, model: targetModel });
        return res;
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Engine Error] Model ${targetModel} on ${client.name} failed:`, err?.message || err);

        if (isRetryableError(err)) {
          // Continue to next client or fallback model in queue
          continue;
        } else {
          // If non-retryable invalid argument, try next key before bailing
          continue;
        }
      }
    }
  }

  throw lastError || new Error("Semua API Key dan Fallback Model Gemini tidak dapat dijangkau.");
};

// Override primary client create method
(primaryAi.interactions as any).create = executeWithFallback;

export const ai = primaryAi;

/**
 * Generate text content (non-streaming) using Gemini with full fallback
 */
export async function generateText(options: {
  model: string;
  systemInstruction?: string;
  prompt: string;
}) {
  const response = await ai.interactions.create({
    model: options.model,
    input: options.prompt,
    system_instruction: options.systemInstruction,
  });

  return (response as any).output_text ?? "";
}

/**
 * Helper to safely extract textual chunk from Gemini Interactions stream events
 */
function extractStreamChunkText(event: any): string {
  if (!event) return "";
  if (typeof event === "string") return event;
  if (event.event_type === "step.delta" && event.delta?.type === "text" && typeof event.delta.text === "string") {
    return event.delta.text;
  }
  if (event.delta?.text && typeof event.delta.text === "string") {
    return event.delta.text;
  }
  if (event.text && typeof event.text === "string") {
    return event.text;
  }
  if (event.output_text && typeof event.output_text === "string") {
    return event.output_text;
  }
  return "";
}

/**
 * Generate streaming text content using Gemini with automatic fallback
 */
export async function generateStreamingText(options: {
  model: string;
  systemInstruction?: string;
  prompt: string;
}): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();
  const rawStream = await ai.interactions.create({
    model: options.model,
    input: options.prompt,
    system_instruction: options.systemInstruction,
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of rawStream as any) {
          const text = extractStreamChunkText(chunk);
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (error) {
        console.error("Stream processing error:", error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Generate streaming chat content using Gemini with automatic fallback
 */
export async function generateStreamingChat(options: {
  model: string;
  systemInstruction?: string;
  messages: Array<{ role: string; content: string }>;
}): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();
  const conversationInput = options.messages
    .map((m) => `${m.role === "model" || m.role === "assistant" ? "Dosen Penguji / Asisten" : "Mahasiswa"}: ${m.content}`)
    .join("\n\n");

  const rawStream = await ai.interactions.create({
    model: options.model,
    input: conversationInput,
    system_instruction: options.systemInstruction,
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of rawStream as any) {
          const text = extractStreamChunkText(chunk);
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (error) {
        console.error("Chat Stream processing error:", error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
}

