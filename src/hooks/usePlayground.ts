import { useState, useCallback } from "react";
import { playgroundApi } from "@/api/playground";
import type { ChatMessage } from "@/types";

export function usePlayground() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string, trade?: string) => {
      const userMessage: ChatMessage = { role: "user", content };
      const nextMessages: ChatMessage[] = [...messages, userMessage];
      setMessages(nextMessages);
      setIsLoading(true);
      setError(null);

      try {
        const response = await playgroundApi.chat(nextMessages, trade);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.reply },
        ]);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to get a response";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages };
}
