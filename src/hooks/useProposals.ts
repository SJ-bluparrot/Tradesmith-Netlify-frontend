import { useMutation } from "@tanstack/react-query";
import { proposalsApi } from "@/api/proposals";
import type { GenerateProposalInput } from "@/types";

export function useGenerateProposal(projectId: string) {
  return useMutation({
    mutationFn: (input: GenerateProposalInput) =>
      proposalsApi.generate(projectId, input),
  });
}
