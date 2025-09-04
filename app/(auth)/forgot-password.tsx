import React, { useState } from 'react';
import { View, Text, Pressable, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingLabelInput from '../utils/_FloatingLabel';
import { LogoLetters } from '../utils/_LogoLetters';
import Logo from '../../assets/aguacate.svg';
import client from '../api/client';

const ForgotPasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = validateEmail(email) && !loading;

  const handleSendCode = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setMessage('');
    setMessageType('');
    
    try {
      await client.post('/auth/forgot-password', { email: email.toLowerCase().trim() });
      
      setMessage('Si el correo existe, te hemos enviado un código (caduca en 15 min)');
      setMessageType('success');
      
      // Navigate automatically after 2 seconds
      setTimeout(() => {
        router.push({
          pathname: '/reset-password',
          params: { email: email.toLowerCase().trim() }
        });
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error de conexión';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-black h-screen" style={{ paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-4 mt-5">
          <View className="items-center">
            <LogoLetters />
          </View>

          <View className="flex-1 flex-col items-center justify-center">
            <View style={{
              width: '90%',
              maxWidth: 500,
              gap: 24,
            }}>
              <View className="mb-6">
                <Text className="text-white text-2xl font-bold text-center mb-2">
                  Recuperar contraseña
                </Text>
                <Text className="text-gray-400 text-center text-base">
                  Introduce tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
                </Text>
              </View>

              {message && (
                <View className={`p-4 rounded-lg mb-4 ${
                  messageType === 'success' ? 'bg-green-900/20 border border-green-600/30' : 'bg-red-900/20 border border-red-600/30'
                }`}>
                  <Text className={`text-center ${
                    messageType === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {message}
                  </Text>
                </View>
              )}

              <FloatingLabelInput
                label="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                inputProps={{ 
                  keyboardType: 'email-address', 
                  autoCapitalize: 'none',
                  testID: 'email-input',
                  accessibilityLabel: 'Campo de correo electrónico'
                }}
              />
              
              {emailError && (
                <Text className="text-red-400 text-sm pl-1 -mt-4">{emailError}</Text>
              )}

              <Pressable
                onPress={handleSendCode}
                disabled={loading}
                className={`w-full py-3 rounded mb-6 justify-center items-center h-[44px] ${
                  loading ? 'bg-gray-700' : 'bg-lime-400'
                }`}
                testID="send-code-button"
                accessibilityLabel="Enviar código de recuperación"
              >
                <Text className={`font-bold ${
                  loading ? 'text-gray-400' : 'text-black'
                }`}>
                  {loading ? 'Enviando...' : 'Enviar código'}
                </Text>
              </Pressable>

              <Link href="/login" asChild>
                <Pressable className="w-full items-center">
                  <Text className="text-green-400 underline">
                    ¿Recordaste tu contraseña? Inicia sesión
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;