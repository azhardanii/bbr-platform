"use client";

import { useState, useCallback, useRef } from "react";

interface UseAIStreamOptions {
  api: string;
  body?: Record<string, any>;
  onFinish?: (completion: string) => void;
  onError?: (error: Error) => void;
}

interface UseAIStreamReturn {
  completion: string;
  isLoading: boolean;
  error: Error | null;
  complete: (prompt: string) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook replacement for Vercel AI SDK's useCompletion.
 * Streams text from an API endpoint and updates state in real-time.
 */
export function useAIStream(options: UseAIStreamOptions): UseAIStreamReturn {
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const complete = useCallback(
    async (prompt: string) => {
      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsLoading(true);
      setError(null);
      setCompletion("");

      try {
        const response = await fetch(options.api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            ...options.body,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP Error ${response.status}`);
        }

        if (!response.body) {
          throw new Error("Response body is empty");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setCompletion(fullText);
        }

        options.onFinish?.(fullText);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [options.api, options.body, options.onFinish, options.onError]
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCompletion("");
    setError(null);
    setIsLoading(false);
  }, []);

  return { completion, isLoading, error, complete, reset };
}
