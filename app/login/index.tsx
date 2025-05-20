import { View, Text, TextInput, Pressable, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import Logo from '../../assets/aguacate.svg';
import { Link } from 'expo-router';
import GoogleIcon from '../../assets/google.svg';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="px-8">
          <View className="items-center pt-4 pb-2">
            <Text className="text-white text-4xl font-bold">RYKO</Text>
          </View>

          {/* Logo grande */}
          <View className="items-center mt-4 mb-8">
            <Logo width={screenWidth * 0.35} height={screenHeight * 0.35} />
          </View>

          {/* Inputs y acciones */}
          <View>
            <TextInput
              placeholder="Correo"
              placeholderTextColor="#ccc"
              className="border border-green-400 rounded px-4 py-3 text-white mb-4"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#ccc"
              secureTextEntry
              className="border border-green-400 rounded px-4 py-3 text-white mb-4"
              value={password}
              onChangeText={setPassword}
            />

            <Pressable className="bg-lime-400 py-3 rounded mb-4 items-center">
              <Text className="font-bold text-black">Inicia sesión</Text>
            </Pressable>

            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-gray-700" />
              <Text className="text-gray-400 mx-2">ó</Text>
              <View className="flex-1 h-px bg-gray-700" />
            </View>

            <Pressable className="flex-row items-center justify-center bg-gray-900 py-3 rounded mb-2">
              <GoogleIcon className="mr-4 " width={24} height={24} />
              <Text className="text-white">Inicia sesión con Google</Text>
            </Pressable>

            <Link href="/register/account" asChild>
              <Pressable>
                <Text className="text-center text-green-400 underline">
                  ¿No tienes cuenta? Regístrate ahora
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

