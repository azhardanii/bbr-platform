import { GoogleGenAI } from "@google/genai";

// Model constants — ONLY use these models
export const MODELS = {
  // Heavy reasoning: judul analysis, bibliometrik, sidang simulator, kompas statistik
  REASONING: "gemini-3.5-flash",
  // Creative text generation: parafrase, SPSS interpretation
  CREATIVE: "gemini-2.5-flash",
  // Fast & lightweight: script WA, quick explanations
  FAST: "gemini-3.1-flash-lite",
  // Embeddings: semantic search (future use)
  EMBEDDING: "gemini-embedding-2",
} as const;

// Initialize the GoogleGenAI clients
const primaryAi = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const backupAi = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY_BACKUP || "dummy-key-to-prevent-crash",
});

// Robust Auto-fallback for API Keys and Models
const executeWithFallback = async (options: any) => {
  const isQuotaError = (err: any) => err?.status === 429 || err?.message?.includes("429") || err?.message?.toLowerCase().includes("quota");
  
  const attempts = [
    { client: primaryAi, model: options.model, name: "Primary API Key" },
  ];
  
  if (process.env.GOOGLE_GENAI_API_KEY_BACKUP) {
    attempts.push({ client: backupAi, model: options.model, name: "Backup API Key" });
  }

  // Model fallbacks if the requested model hits limit everywhere
  // Fallback map: REASONING -> CREATIVE
  if (options.model === MODELS.REASONING) {
    attempts.push({ client: primaryAi, model: MODELS.CREATIVE, name: "Primary API Key (Fallback Model)" });
    if (process.env.GOOGLE_GENAI_API_KEY_BACKUP) {
      attempts.push({ client: backupAi, model: MODELS.CREATIVE, name: "Backup API Key (Fallback Model)" });
    }
  }

  let lastError;
  for (const attempt of attempts) {
    try {
      if (attempt.model !== options.model) {
        console.warn(`[AI Fallback] Retrying with fallback model ${attempt.model} using ${attempt.name}`);
      } else if (attempt.client === backupAi) {
        console.warn(`[AI Fallback] Retrying with ${attempt.name}`);
      }
      
      const createFn = attempt.client.interactions.create.bind(attempt.client.interactions);
      return await createFn({ ...options, model: attempt.model });
    } catch (err: any) {
      lastError = err;
      if (isQuotaError(err)) {
        console.warn(`[AI Quota Error] Failed on ${attempt.name} with model ${attempt.model}`);
        continue; // Try next strategy in queue
      } else {
        // Non-quota error, don't fallback, just throw
        throw err;
      }
    }
  }
  
  throw lastError; // All attempts failed
};

// Override the primary client's create method
(primaryAi.interactions as any).create = executeWithFallback;

export const ai = primaryAi;

/**
 * Generate text content (non-streaming) using Gemini
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
 * Generate streaming text content using Gemini
 * Returns a ReadableStream compatible with Next.js streaming responses
 */
export async function generateStreamingText(options: {
  model: string;
  systemInstruction?: string;
  prompt: string;
}): Promise<ReadableStream> {
  const stream = await ai.interactions.create({
    model: options.model,
    input: options.prompt,
    system_instruction: options.systemInstruction,
    stream: true,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const rawEvent of stream) {
          const event = rawEvent as any;
          if (event.event_type === "content.delta" || event.event_type === "step.delta") {
            const text = event.delta?.text ?? event.content?.text ?? "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Generate streaming chat response (multi-turn conversation)
 * Accepts an array of messages with role and content
 */
export async function generateStreamingChat(options: {
  model: string;
  systemInstruction?: string;
  messages: Array<{ role: "user" | "model"; content: string }>;
}): Promise<ReadableStream> {
  // Format history as a single string since interactions input expects a single input block per turn
  const historyText = options.messages.map(msg =>
    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
  ).join('\n\n');

  const stream = await ai.interactions.create({
    model: options.model,
    input: historyText,
    system_instruction: options.systemInstruction,
    stream: true,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const rawEvent of stream) {
          const event = rawEvent as any;
          if (event.event_type === "content.delta" || event.event_type === "step.delta") {
            const text = event.delta?.text ?? event.content?.text ?? "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

