import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

const ResetPasswordScreen = () => {
  const params = useLocalSearchParams();
  const [email, setEmail] = useState((params.email as string) || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Cooldown timer for code resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCode = (code: string): boolean => {
    return /^\d{6}$/.test(code);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const isFormValid = 
    validateEmail(email) && 
    validateCode(code) && 
    validatePassword(newPassword) && 
    !loading;

  const handleResetPassword = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setMessage('');
    setMessageType('');
    
    try {
      await client.post('/auth/reset-password', {
        email: email.toLowerCase().trim(),
        code: code.trim(),
        newPassword
      });
      
      setMessage('Contraseña actualizada correctamente');
      setMessageType('success');
      
      // Navigate automatically after 2 seconds
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error de conexión';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!validateEmail(email) || resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setMessage('');
    setMessageType('');
    
    try {
      await client.post('/auth/forgot-password', { email: email.toLowerCase().trim() });
      setResendCooldown(60); // 60 seconds of cooldown
      setMessage('Si el correo existe, te hemos enviado un nuevo código');
      setMessageType('success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error de conexión';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setResendLoading(false);
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
                Nueva contraseña
              </Text>
              <Text className="text-zinc-400 text-base">
                Ingresa el código que recibiste y tu nueva contraseña
              </Text>
            </View>

            {!params.email && (
              <View className="mb-6">
                <Text className="text-white text-sm font-medium mb-2">
                  Correo electrónico
                </Text>
                <TextInput
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
              </View>
            )}

            <View className="mb-6">
              <Text className="text-white text-sm font-medium mb-2">
                Código de 6 dígitos
              </Text>
              <TextInput
                testID="codeInput"
                accessibilityLabel="Campo de código de verificación"
                value={code}
                onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                placeholderTextColor="#71717a"
                keyboardType="numeric"
                maxLength={6}
                editable={!loading}
                className={`bg-zinc-800 text-white px-4 py-3 rounded-lg text-base font-mono tracking-widest text-center ${
                  code && !validateCode(code) ? 'border border-red-500' : ''
                }`}
              />
              {code && !validateCode(code) && (
                <Text className="text-red-400 text-sm mt-1">
                  El código debe tener exactamente 6 dígitos
                </Text>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-white text-sm font-medium mb-2">
                Nueva contraseña
              </Text>
              <View className="relative">
                <TextInput
                  testID="newPwdInput"
                  accessibilityLabel="Campo de nueva contraseña"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="#71717a"
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  className={`bg-zinc-800 text-white px-4 py-3 pr-12 rounded-lg text-base ${
                    newPassword && !validatePassword(newPassword) ? 'border border-red-500' : ''
                  }`}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#71717a"
                  />
                </TouchableOpacity>
              </View>
              {newPassword && !validatePassword(newPassword) && (
                <Text className="text-red-400 text-sm mt-1">
                  La contraseña debe tener al menos 8 caracteres
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
                {messageType === 'success' && message.includes('Contraseña actualizada') && (
                  <Text className="text-zinc-400 text-sm text-center mt-2">
                    Redirigiendo al login en 2 segundos...
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              testID="resetBtn"
              accessibilityLabel="Botón cambiar contraseña"
              onPress={handleResetPassword}
              disabled={!isFormValid || (messageType === 'success' && message.includes('Contraseña actualizada'))}
              className={`py-3 rounded-lg mb-4 ${
                isFormValid && !(messageType === 'success' && message.includes('Contraseña actualizada'))
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
                  isFormValid && !(messageType === 'success' && message.includes('Contraseña actualizada')) ? 'text-white' : 'text-zinc-400'
                }`}>
                  {loading ? 'Cambiando...' : (messageType === 'success' && message.includes('Contraseña actualizada')) ? 'Contraseña cambiada' : 'Cambiar contraseña'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              testID="resendBtn"
              accessibilityLabel="Botón reenviar código"
              onPress={handleResendCode}
              disabled={!validateEmail(email) || resendCooldown > 0 || resendLoading}
              className="py-2 mb-4"
            >
              <View className="flex-row items-center justify-center">
                {resendLoading && (
                  <ActivityIndicator 
                    size="small" 
                    color="#22c55e" 
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text className={`text-center ${
                  resendCooldown > 0 || resendLoading || !validateEmail(email)
                    ? 'text-zinc-500'
                    : 'text-green-400'
                }`}>
                  {resendCooldown > 0 
                    ? `Reenviar código (${resendCooldown}s)`
                    : resendLoading
                    ? 'Reenviando...'
                    : 'Reenviar código'
                  }
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="py-2"
            >
              <Text className="text-green-400 text-center">
                Volver
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;