import { create } from "zustand";

interface UiState {
  activeTab: "dashboard" | "projects" | "playground";
  setActiveTab: (tab: UiState["activeTab"]) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeTab: "dashboard",
  setActiveTab: (activeTab) => set({ activeTab }),
}));
