import { create } from "zustand";
import { getToken, removeToken } from "../services/_storage";
import api from "../api/client";

export interface User {
  id: number;
  username: string;
  email: string;
  type: "admin" | "user";
  // Profile data
  birthdate?: string;
  gender?: string;
  country?: string;
  weight?: number;
  height?: number;
  aim?: string;
  calorieGoal?: number;
  proteinPct?: number;
  carbsPct?: number;
  fatPct?: number;
  intolerances?: string[];
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
}

// Avoid duplicated API calls
let loadUserPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  setToken: (token: string) => {
    set({ token });
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  logout: async () => {
    await removeToken();
    set({ user: null, token: null });
    loadUserPromise = null; // Reset promise cache
  },

  initializeAuth: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });
    try {
      const token = await getToken();
      if (token) {
        set({ token });
        await get().loadUserProfile();
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  loadUserProfile: async () => {
    const { token } = get();
    if (!token) return;

    // Avoid duplicated API calls using promise caché
    if (loadUserPromise) {
      return loadUserPromise;
    }

    loadUserPromise = (async () => {
      try {
        set({ isLoading: true });
        const { data } = await api.get<User>("/auth/me");
        set({ user: data });
      } catch (error: any) {
        console.error("Error loading user profile:", error);
        if (error.response?.status === 401) {
          await get().logout();
        }
      } finally {
        set({ isLoading: false });
        loadUserPromise = null; // Reset cache after completion
      }
    })();

    return loadUserPromise;
  },
}));
