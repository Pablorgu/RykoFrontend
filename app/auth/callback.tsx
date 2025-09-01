import { useEffect, useMemo } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAuthStore } from "../(store)/authStore";

function firstStr(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default function AuthCallback() {
  const params = useLocalSearchParams();
  const token = useMemo(() => firstStr(params.token as any), [params]);
  const { loginWithToken } = useAuthStore();

  useEffect(() => {
    (async () => {
      if (!token) {
        router.replace("/login");
        return;
      }
      
      await loginWithToken(token);
      router.replace("/home");
    })();
  }, [token, loginWithToken]);

  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator />
      <Text className="mt-2 text-white/70">Iniciando sesión…</Text>
    </View>
  );
}
