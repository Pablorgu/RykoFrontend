import api from "../api/client";
import { storeToken, removeToken } from "../services/_storage";
import { useAuthStore } from "../(store)/authStore";

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  type: "admin" | "user";
}

export async function loginLocal(
  email: string,
  password: string
): Promise<boolean> {
  try {
    const { data } = await api.post<{ access_token: string }>("/auth/login", {
      email,
      password,
    });

    await storeToken(data.access_token);

    // Update store
    const { setToken, loadUserProfile } = useAuthStore.getState();
    setToken(data.access_token);
    await loadUserProfile();

    return true;
  } catch (err: any) {
    return false;
  }
}

export async function registerLocal(
  email: string,
  password: string
): Promise<boolean> {
  try {
    const { data } = await api.post<{ access_token: string }>(
      "/auth/register",
      { email, password }
    );

    await storeToken(data.access_token);

    // Update store
    const { setToken, loadUserProfile } = useAuthStore.getState();
    setToken(data.access_token);
    await loadUserProfile();

    return true;
  } catch (error) {
    return false;
  }
}

export async function logout(): Promise<void> {
  const { logout } = useAuthStore.getState();
  await logout();
}

export async function getCurrentUser(): Promise<User | null> {
  const { user } = useAuthStore.getState();
  return user;
}
