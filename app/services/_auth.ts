import api from "../api/client";
import { storeToken, removeToken } from "../services/_storage";

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
    return true;
  } catch (error) {
    console.error("Error en registro:", error);
    return false;
  }
}

export async function loginWithGoogle(token: string) {
  console.log("JWT:", token);
}

export async function logout(): Promise<void> {
  await removeToken();
}

export async function getCurrentUser(token: string): Promise<User | null> {
  try {
    const { data } = await api.get<User>("/auth/me", {
      data: { token },
    });
    return data;
  } catch (error: any) {
    console.error("Error obteniendo usuario:", error);

    if (error.response?.status === 401 || error.response?.status === 403) {
      await removeToken();
    }

    return null;
  }
}

// export async function getUserId(): Promise<string | null> {
//   const user = await getCurrentUser(d);
//   return user?.id.toString() || null;
// }

// export async function isAuthenticated(): Promise<boolean> {
//   const user = await getCurrentUser();
//   return user !== null;
// }
