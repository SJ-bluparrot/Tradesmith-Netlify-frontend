import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { estimatesApi } from "@/api/estimates";
import type { GenerateEstimateInput, LineItem } from "@/types";

export const estimateKeys = {
  detail: (projectId: string) => ["estimates", projectId] as const,
};

export function useEstimate(projectId: string) {
  return useQuery({
    queryKey: estimateKeys.detail(projectId),
    queryFn: () => estimatesApi.get(projectId),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

export function useGenerateEstimate(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GenerateEstimateInput) =>
      estimatesApi.generate(projectId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: estimateKeys.detail(projectId),
      });
    },
  });
}

export function useUpdateEstimate(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lineItems: LineItem[]) =>
      estimatesApi.updateLineItems(projectId, lineItems),
    onSuccess: (updated) => {
      queryClient.setQueryData(estimateKeys.detail(projectId), updated);
    },
  });
}
