import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingLabelInput from '../utils/FloatingLabel';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import Logo from '../../assets/aguacate.svg';
import GoogleIcon from '../../assets/google.svg';
import { LogoLetters } from '../utils/LogoLetters';
import { loginLocal } from '../services/auth';

const screenWidth = Dimensions.get('window').width;
const MAX_LOGO = 400;
const logoSize = Math.min(screenWidth * 0.5, MAX_LOGO);

export default function Login() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');

  const handleLogin = async () => {
    setEmailError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Introduce un correo válido');
      return;
    }

    setLoading(true);
    const ok = await loginLocal(email.trim(), password);
    setLoading(false);

    if (ok) {
      router.replace('/home');
    } else {
      setEmailError('Email o contraseña incorrectos');
    }
  };

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
          <View className="items-center">
            <LogoLetters />
          </View>

          <View className="flex-col items-center justify-center">
            <View className="w-full flex-1 items-center mt-10 mb-10">
              <Logo width={logoSize} height={logoSize} />
            </View>
            <View style={{
              width: '90%',
              maxWidth: 500,
              gap: 24,
            }}>
              <FloatingLabelInput
                label="Correo electronico"
                value={email}
                onChangeText={setEmail}
                inputProps={{ keyboardType: 'email-address', autoCapitalize: 'none' }}
              />

              {emailError !== '' && (
                <Text className="text-red-500 text-base pl-1 mb-2 -mt-6">{emailError}</Text>
              )}

              <FloatingLabelInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                inputProps={{ secureTextEntry: true }}
              />

              <Pressable onPress={handleLogin}
                className="w-full bg-lime-400 py-3 rounded mb-6 justify-center items-center h-[44px]"
              >
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
    </SafeAreaView >
  );
}
