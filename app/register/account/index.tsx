import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingLabelInput from '../../utils/FloatingLabel';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import Logo from '../../../assets/aguacate.svg';
import GoogleIcon from '../../../assets/google.svg';

const screenWidth = Dimensions.get('window').width;
const MAX_LOGO = 400;
const logoSize = Math.min(screenWidth * 0.5, MAX_LOGO);

export default function RegisterAccount() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleRegister = () => {
    setEmailError('');
    setPasswordError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Introduce un correo válido');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    console.log('Registrar con:', { email, password });
  };

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
          <View className="flex-1 px-4 mt-5">
            <View className="items-center">
              <Text className="text-white text-5xl font-bold">RYKO</Text>
            </View>

            <View className="flex-col items-center justify-center">
              <View className="w-full flex-1 items-center mt-10 mb-10">
                <Logo width={logoSize} height={logoSize} />
              </View>

              <View className="w-[90%] max-w-[500px] justify-end">

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
                  <Text className="text-red-500 text-sm mb-2">{passwordError}</Text>
                )}

                <Pressable onPress={handleRegister} className="w-full bg-lime-400 py-3 rounded mb-6 items-center h-[44px]">
                  <Text className="font-bold text-black">Registrarse</Text>
                </Pressable>

                <View className="flex-row items-center w-full mb-4">
                  <View className="flex-1 h-px bg-gray-700" />
                  <Text className="text-gray-400 mx-2">ó</Text>
                  <View className="flex-1 h-px bg-gray-700" />
                </View>

                <Pressable className="w-full flex-row items-center justify-center bg-gray-900 py-3 rounded mb-6">
                  <GoogleIcon width={24} height={24} className="mr-2" />
                  <Text className="text-white font-semibold mx-2">
                    Registrate con Google
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

