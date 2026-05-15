import { apiClient } from "./client";
import type { ProposalResult, GenerateProposalInput } from "@/types";

export const proposalsApi = {
  generate: async (
    projectId: string,
    input: GenerateProposalInput
  ): Promise<ProposalResult> => {
    const { data } = await apiClient.post<ProposalResult>(
      `/api/projects/${projectId}/proposal`,
      input
    );
    return data;
  },
};
