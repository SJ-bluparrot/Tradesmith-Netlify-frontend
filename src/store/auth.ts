import { create } from "zustand";

interface AuthState {
  isSignedIn: boolean;
  userId: string | null;
  sessionToken: string | null;
  setSession: (userId: string, token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isSignedIn: false,
  userId: null,
  sessionToken: null,
  setSession: (userId, sessionToken) =>
    set({ isSignedIn: true, userId, sessionToken }),
  clearSession: () =>
    set({ isSignedIn: false, userId: null, sessionToken: null }),
}));
