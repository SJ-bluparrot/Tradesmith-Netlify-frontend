import { apiClient } from "./client";
import type { ChatMessage, PlaygroundResponse } from "@/types";

export const playgroundApi = {
  chat: async (
    messages: ChatMessage[],
    trade?: string
  ): Promise<PlaygroundResponse> => {
    const { data } = await apiClient.post<PlaygroundResponse>(
      "/api/playground",
      { messages, trade: trade ?? "carpenter" }
    );
    return data;
  },
};
