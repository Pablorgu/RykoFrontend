import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import Logo from '../../assets/aguacate.svg';
import GoogleIcon from '../../assets/google.svg';

const screenWidth = Dimensions.get('window').width;
const MAX_LOGO = 400;
const logoSize = Math.min(screenWidth * 0.5, MAX_LOGO);

export default function Login() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView
      className="bg-black h-screen"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-4 mt-5">
          <View className="items-center ">
            <Text className="text-white text-5xl font-bold">RYKO</Text>
          </View>

          <View className="flex-col items-center justify-center">
            <View className="w-full flex-1 items-center mt-10 mb-10">
              <Logo width={logoSize} height={logoSize} />
            </View>
            <View className="w-[90%] max-w-[500px]  justify-end">
              <TextInput
                placeholder="Correo"
                placeholderTextColor="#ccc"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                className="w-full h-[44px] border-2 border-green-400 rounded px-4 text-white mb-4"
              />

              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#ccc"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="w-full border border-green-400 rounded px-4 py-3 text-white mb-6"
              />

              <Pressable className="w-full bg-lime-400 py-3 rounded mb-6 items-center">
                <Text className="font-bold text-black">Inicia sesión</Text>
              </Pressable>

              <View className="flex-row items-center w-full mb-4">
                <View className="flex-1 h-px bg-gray-700" />
                <Text className="text-gray-400 mx-2">ó</Text>
                <View className="flex-1 h-px bg-gray-700" />
              </View>

              <Pressable className="w-full flex-row items-center justify-center bg-gray-900 py-3 rounded mb-6">
                <GoogleIcon width={24} height={24} className="mr-2" />
                <Text className="text-white font-semibold mx-2">
                  Inicia sesión con Google
                </Text>
              </Pressable>

              <Link href="/register/account" asChild>
                <Pressable className="w-full items-center">
                  <Text className="text-green-400 underline">
                    ¿No tienes cuenta? Regístrate ahora
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
