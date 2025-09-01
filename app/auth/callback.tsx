import { useEffect, useMemo } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { storeToken } from "../services/_storage";
import api from "../api/client";

function firstStr(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default function AuthCallback() {
  const params = useLocalSearchParams();
  const token = useMemo(() => firstStr(params.token as any), [params]);

useEffect(() => {
  (async () => {
    if (!token) {
      router.replace("/login");
      return;
    }
    await storeToken(token);
    setTimeout(() => router.replace("/home"), 50);
  })();
}, [token]);

  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator />
      <Text className="mt-2 text-white/70">Iniciando sesión…</Text>
    </View>
  );
}
