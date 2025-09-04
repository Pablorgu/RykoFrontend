import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import client from '../api/client';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

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
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-zinc-900 px-6 py-8">
          <View className="flex-1 justify-center">
            <View className="mb-8">
              <Text className="text-white text-3xl font-bold mb-2">
                Recuperar contraseña
              </Text>
              <Text className="text-zinc-400 text-base">
                Te enviaremos un código de 6 dígitos si el correo existe
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-white text-sm font-medium mb-2">
                Correo electrónico
              </Text>
              <TextInput
                testID="emailInput"
                accessibilityLabel="Campo de correo electrónico"
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor="#71717a"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                className={`bg-zinc-800 text-white px-4 py-3 rounded-lg text-base ${
                  email && !validateEmail(email) ? 'border border-red-500' : ''
                }`}
              />
              {email && !validateEmail(email) && (
                <Text className="text-red-400 text-sm mt-1">
                  Ingresa un correo válido
                </Text>
              )}
            </View>

            {message && (
              <View className={`p-4 rounded-lg mb-4 ${
                messageType === 'success' ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'
              }`}>
                <Text className={`text-center ${
                  messageType === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {message}
                </Text>
                {messageType === 'success' && (
                  <Text className="text-zinc-400 text-sm text-center mt-2">
                    Redirigiendo en 2 segundos...
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              testID="sendCodeBtn"
              accessibilityLabel="Botón enviar código"
              onPress={handleSendCode}
              disabled={!isFormValid || messageType === 'success'}
              className={`py-3 rounded-lg mb-4 ${
                isFormValid && messageType !== 'success'
                  ? 'bg-green-600 active:bg-green-700'
                  : 'bg-zinc-700'
              }`}
            >
              <View className="flex-row items-center justify-center">
                {loading && (
                  <ActivityIndicator 
                    size="small" 
                    color="white" 
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text className={`text-center font-semibold ${
                  isFormValid && messageType !== 'success' ? 'text-white' : 'text-zinc-400'
                }`}>
                  {loading ? 'Enviando...' : messageType === 'success' ? 'Código enviado' : 'Enviar código'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="py-2"
            >
              <Text className="text-green-400 text-center">
                Volver al inicio de sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;