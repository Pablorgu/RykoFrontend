import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FloatingLabelInput from '../utils/_FloatingLabel';
import { LogoLetters } from '../utils/_LogoLetters';
import Logo from '../../assets/aguacate.svg';
import client from '../api/client';

const ResetPasswordScreen = () => {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState((params.email as string) || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
    // Reset errors
    setCodeError('');
    setPasswordError('');
    setMessage('');
    setMessageType('');

    // Validate form
    let hasErrors = false;
    
    if (!validateCode(code)) {
      setCodeError('El código debe tener 6 dígitos');
      hasErrors = true;
    }
    
    if (!validatePassword(newPassword)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      hasErrors = true;
    }
    
    if (hasErrors) return;

    setLoading(true);
    
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
              gap: 20,
            }}>
              <View className="mb-4">
                <Text className="text-white text-2xl font-bold text-center mb-2">
                  Restablecer contraseña
                </Text>
                <Text className="text-gray-400 text-center text-base">
                  Introduce el código que recibiste en tu correo y tu nueva contraseña.
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
                label="Código de verificación"
                value={code}
                onChangeText={setCode}
                inputProps={{ 
                  keyboardType: 'numeric',
                  maxLength: 6,
                  testID: 'code-input',
                  accessibilityLabel: 'Campo de código de verificación',
                }}
              />
              
              {codeError && (
                <Text className="text-red-400 text-sm pl-1 -mt-4">{codeError}</Text>
              )}

              <View className="relative">
                <FloatingLabelInput
                  label="Nueva contraseña"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  inputProps={{ 
                    secureTextEntry: !showPassword,
                    testID: 'password-input',
                    accessibilityLabel: 'Campo de nueva contraseña'
                  }}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                  testID="toggle-password-visibility"
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <Text className="text-gray-400 text-lg">{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </Pressable>
              </View>
              
              {passwordError && (
                <Text className="text-red-400 text-sm pl-1 -mt-4">{passwordError}</Text>
              )}

              <Pressable
                onPress={handleResetPassword}
                disabled={loading}
                className={`w-full py-3 rounded mb-4 justify-center items-center h-[44px] ${
                  loading ? 'bg-gray-700' : 'bg-lime-400'
                }`}
                testID="reset-password-button"
                accessibilityLabel="Restablecer contraseña"
              >
                <Text className={`font-bold ${
                  loading ? 'text-gray-400' : 'text-black'
                }`}>
                  {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
                </Text>
              </Pressable>

              <View className="flex-row items-center w-full mb-4">
                <View className="flex-1 h-px bg-gray-700" />
                <Text className="text-gray-400 mx-2">¿No recibiste el código?</Text>
                <View className="flex-1 h-px bg-gray-700" />
              </View>

              <Pressable
                onPress={handleResendCode}
                disabled={resendLoading || resendCooldown > 0}
                className={`w-full py-3 rounded justify-center items-center h-[44px] border ${
                  resendLoading || resendCooldown > 0
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-green-600 bg-transparent'
                }`}
                testID="resend-code-button"
                accessibilityLabel="Reenviar código de verificación"
              >
                <Text className={`font-semibold ${
                  resendLoading || resendCooldown > 0 ? 'text-gray-500' : 'text-green-400'
                }`}>
                  {resendLoading
                    ? 'Reenviando...'
                    : resendCooldown > 0
                    ? `Reenviar en ${resendCooldown}s`
                    : 'Reenviar código'
                  }
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;