import { apiClient } from "./client";
import type { Estimate, GenerateEstimateInput, LineItem } from "@/types";

export const estimatesApi = {
  get: async (projectId: string): Promise<Estimate | null> => {
    const { data } = await apiClient.get<Estimate | null>(
      `/api/projects/${projectId}/estimate`
    );
    return data;
  },

  generate: async (
    projectId: string,
    input: GenerateEstimateInput
  ): Promise<Estimate> => {
    const { data } = await apiClient.post<Estimate>(
      `/api/projects/${projectId}/estimate`,
      input
    );
    return data;
  },

  updateLineItems: async (
    projectId: string,
    lineItems: LineItem[]
  ): Promise<Estimate> => {
    const { data } = await apiClient.patch<Estimate>(
      `/api/projects/${projectId}/estimate`,
      { lineItems }
    );
    return data;
  },
};
