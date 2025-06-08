import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingLabelInput from '../../utils/FloatingLabel';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import GoogleIcon from '../../../assets/google.svg';
import { LogoTitle } from '../../utils/LogoTitle';


export default function RegisterAccount() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const isPasswordMatch = password.length > 0 && password === confirmPassword

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fade = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleRegister = () => {
    setEmailError('')
    setPasswordError('')

    let valid = true

    if (!isEmailValid) {
      setEmailError('Introduce un correo válido')
      valid = false
    }

    if (!isPasswordMatch) {
      setPasswordError('Las contraseñas no coinciden')
      valid = false
    }

    if (!valid) return

    router.push('/register/personal')
  }

  return (
    <SafeAreaView
      className="bg-black flex-1"
      style={{ paddingTop: insets.top }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ flex: 1, opacity: fade, paddingVertical: 20 }}>
            <View className="items-center mb-20">
              <LogoTitle />
              <Text className="text-gray-500 mt-2">Paso 1 de 3</Text>
            </View>

            <View className="flex-col items-center justify-center">
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

                <FloatingLabelInput
                  label="Confirmar Contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  inputProps={{ secureTextEntry: true }}
                />

                {passwordError !== '' && (
                  <Text className="text-red-500 text-sm -mt-4 mb-6">{passwordError}</Text>
                )}

                <Pressable onPress={handleRegister} className="w-full bg-lime-400 py-3 rounded justify-center items-center h-[44px]">
                  <Text className="font-bold text-black">Siguiente</Text>
                </Pressable>

                <View className="flex-row items-center w-full">
                  <View className="flex-1 h-px bg-gray-700" />
                  <Text className="text-gray-400 mx-2">ó</Text>
                  <View className="flex-1 h-px bg-gray-700" />
                </View>

                <Pressable className="w-full flex-row items-center justify-center bg-gray-900 py-3 rounded mb-6">
                  <GoogleIcon width={24} height={24} className="mr-2" />
                  <Text className="text-white font-semibold mx-2">
                    Regístrate con Google
                  </Text>
                </Pressable>

                <Link href="/login" asChild>
                  <Pressable className="w-full items-center">
                    <Text className="text-green-400 underline">
                      ¿Ya tienes cuenta? Inicia sesión
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
