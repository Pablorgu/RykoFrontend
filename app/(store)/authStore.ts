import { create } from "zustand";
import { getToken, removeToken, storeToken } from "../services/_storage";
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
  isHydrated: boolean; // Nuevo estado

  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>; // Nueva función
}

// Avoid duplicated API calls
let loadUserPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  isHydrated: false,

  setToken: (token: string) => {
    set({ token });
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  logout: async () => {
    await removeToken();
    delete api.defaults.headers.common.Authorization;
    set({ user: null, token: null });
    loadUserPromise = null; // Reset promise cache
  },

  loginWithToken: async (token: string) => {
    try {
      set({ isLoading: true });
      await storeToken(token);
      get().setToken(token);
      await get().loadUserProfile();
      set({ isHydrated: true });
    } catch (error) {
      await get().logout();
    } finally {
      set({ isLoading: false });
    }
  },

  initializeAuth: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });
    try {
      const token = await getToken();
      if (token) {
        get().setToken(token);
        await get().loadUserProfile();
      }
    } finally {
      set({ isLoading: false, isInitialized: true, isHydrated: true });
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
