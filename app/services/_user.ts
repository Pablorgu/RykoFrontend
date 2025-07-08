import api from "../api/client";
import { UserProfile, useUserProfile } from "../context/UserProfileContext";
import { getToken } from "./_storage";

export async function getCurrentUserId(): Promise<number | null> {
  try {
    const token = await getToken();
    console.log("Token sacado:", token);
    if (!token) return null;
    const { data } = await api.get(`/auth/me?token=${token}`);
    return data.id;
  } catch (error) {
    console.error("Error obteniendo ID del usuario:", error);
    return null;
  }
}

export async function updateUserProfile(
  profileData: UserProfile
): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    console.log("ID del usuario:", userId);
    if (!userId) return false;

    await api.put(`/users/update-profile/${userId}`, profileData);
    return true;
  } catch (error) {
    console.error("Error actualizando perfil de usuario:", error);
    return false;
  }
}
