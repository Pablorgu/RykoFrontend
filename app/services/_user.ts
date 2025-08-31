import api from "../api/client";
import { UserProfile, useUserProfile } from "../context/UserProfileContext";
import { useAuthStore } from "../(store)/authStore";
import { UserProfileDto } from "../(types)/_UserProfileDto";

export async function getCurrentUserId(): Promise<number | null> {
  const { user, loadUserProfile } = useAuthStore.getState();

  if (user) {
    return user.id;
  }

  // If no user try to load it
  try {
    await loadUserProfile();
    const { user: updatedUser } = useAuthStore.getState();
    return updatedUser?.id || null;
  } catch (error) {
    console.error("Error obteniendo ID del usuario:", error);
    return null;
  }
}

export async function getUserProfile(userId: number): Promise<any | null> {
  try {
    const { data } = await api.get(`/users/profile/${userId}`);
    console.log("Perfil del usuario obtenido:", data);
    return data;
  } catch (error) {
    console.error("Error obteniendo perfil del usuario:", error);
    return null;
  }
}

export async function updateUserProfile(
  profileData: UserProfileDto
): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    await api.put(`/users/update-profile/${userId}`, profileData);

    // Update user in store after update
    const { loadUserProfile } = useAuthStore.getState();
    await loadUserProfile();

    return true;
  } catch (error) {
    console.error("Error actualizando perfil de usuario:", error);
    return false;
  }
}
