import { apiClient } from "./client";
import type { Project, CreateProjectInput } from "@/types";

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>("/api/projects");
    return data;
  },

  get: async (id: string): Promise<Project> => {
    const { data } = await apiClient.get<Project>(`/api/projects/${id}`);
    return data;
  },

  create: async (input: CreateProjectInput): Promise<Project> => {
    const { data } = await apiClient.post<Project>("/api/projects", input);
    return data;
  },
};
