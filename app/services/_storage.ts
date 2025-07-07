import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "userToken";

export async function storeToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    console.log("web");
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    console.log("ios");
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return sessionStorage.getItem(TOKEN_KEY);
  } else {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }
}

export async function removeToken(): Promise<void> {
  if (Platform.OS === "web") {
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
