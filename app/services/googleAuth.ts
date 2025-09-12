import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

/**
 * Centralized service for Google OAuth authentication
 * Handles both web and mobile without code duplication
 */
export const authWithGoogle = async (): Promise<void> => {
  try {
    let redirectUri: string;

    // Calcular redirectUri correctamente para cada plataforma
    if (Platform.OS === "web") {
      redirectUri = `${window.location.origin}/auth/callback`;
    } else {
      redirectUri = AuthSession.makeRedirectUri({
        scheme: "ryko",
        path: "auth/callback",
      });
    }

    const authUrl = `${
      process.env.API_BASE_URL
    }/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

    if (Platform.OS === "web") {
      window.location.href = authUrl;
    } else {
      await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    }
  } catch (error) {
    throw error;
  }
};
