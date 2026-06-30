"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface UseAIChatOptions {
  api: string;
  onFinish?: (messages: ChatMessage[]) => void;
  onError?: (error: Error) => void;
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content?: string) => Promise<void>;
  setMessages: (messages: ChatMessage[]) => void;
  startConversation: (systemInstruction: string, initialUserMessage: string) => Promise<void>;
  reset: () => void;
}

let messageCounter = 0;
function generateId() {
  return `msg-${Date.now()}-${++messageCounter}`;
}

/**
 * Custom hook replacement for Vercel AI SDK's useChat.
 * Handles multi-turn conversation with streaming responses.
 */
export function useAIChat(options: UseAIChatOptions): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const systemInstructionRef = useRef<string>("");

  const fetchAssistantResponse = useCallback(
    async (currentMessages: ChatMessage[]) => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Add a placeholder assistant message
      const assistantId = generateId();
      const updatedMessages: ChatMessage[] = [
        ...currentMessages,
        { id: assistantId, role: "assistant", content: "" },
      ];
      setMessages(updatedMessages);

      try {
        const response = await fetch(options.api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: currentMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            systemInstruction: systemInstructionRef.current,
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

          // Update the assistant message in-place
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: fullText } : m
            )
          );
        }

        const finalMessages = currentMessages.concat({
          id: assistantId,
          role: "assistant",
          content: fullText,
        });
        options.onFinish?.(finalMessages);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        // Remove the empty assistant placeholder on error
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [options.api, options.onFinish, options.onError]
  );

  const sendMessage = useCallback(
    async (content?: string) => {
      const messageContent = content || input;
      if (!messageContent.trim()) return;

      setIsLoading(true);
      setError(null);
      setInput("");

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: messageContent,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      await fetchAssistantResponse(updatedMessages);
    },
    [input, messages, fetchAssistantResponse]
  );

  const startConversation = useCallback(
    async (systemInstruction: string, initialUserMessage: string) => {
      setIsLoading(true);
      setError(null);
      systemInstructionRef.current = systemInstruction;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: initialUserMessage,
      };

      const initialMessages = [userMessage];
      setMessages(initialMessages);

      await fetchAssistantResponse(initialMessages);
    },
    [fetchAssistantResponse]
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setInput("");
    setError(null);
    setIsLoading(false);
    systemInstructionRef.current = "";
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    setMessages,
    startConversation,
    reset,
  };
}
