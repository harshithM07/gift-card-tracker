import { create } from "zustand";

export type StoragePreference = "remote" | "local";

interface User {
  id: string;
  email: string;
  is_admin: boolean;
}

interface AppState {
  user: User | null;
  isAuthLoaded: boolean;
  storagePreference: StoragePreference;
  setUser: (user: User | null) => void;
  setAuthLoaded: (loaded: boolean) => void;
  setStoragePreference: (pref: StoragePreference) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthLoaded: false,
  storagePreference: "remote",
  setUser: (user) => set({ user }),
  setAuthLoaded: (isAuthLoaded) => set({ isAuthLoaded }),
  setStoragePreference: (storagePreference) => set({ storagePreference }),
}));
