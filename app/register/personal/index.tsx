import React, { useState, useEffect, useRef } from 'react'
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FloatingLabelInput from '../../utils/_FloatingLabel'
import FloatingLabelSelect from '../../utils/_FloatingLabelSelect'
import { LogoTitle } from '../../utils/_LogoTitle'
import { DatePickerField } from '../../utils/_DateTimePicker'
import { useUserProfile } from '../../context/UserProfileContext'
import { updateUserProfile } from '../../services/_user';
import { useAuthStore } from '../../(store)/authStore';

export default function RegisterPersonal() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { profile, setProfile } = useUserProfile()
  const { loadUserProfile } = useAuthStore()

  const [birthdate, setBirthdate] = useState<Date | null>(null)
  const [gender, setGender] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})

  // Validación mejorada
  const validateFields = () => {
    const errors: {[key: string]: string} = {}
    
    if (!birthdate) {
      errors.birthdate = 'La fecha de nacimiento es obligatoria'
    } else {
      const today = new Date()
      const age = today.getFullYear() - birthdate.getFullYear()
      if (age < 13) {
        errors.birthdate = 'Debes tener al menos 13 años'
      } else if (age > 120) {
        errors.birthdate = 'Por favor, verifica la fecha de nacimiento'
      }
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isStepValid = !!birthdate && Object.keys(fieldErrors).length === 0

  const fade = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleNext = async () => {
    if (!validateFields()) return
    
    setError('') 
    setIsLoading(true)
    
    const isoDate = birthdate ? birthdate.toISOString().split('T')[0] : undefined;
    
    setProfile(prev => ({
      ...prev,
      birthdate: isoDate, 
      gender: gender || undefined,
      country: country || undefined
    }))
    
    try {
      const profileData = {
        birthdate: isoDate,
        gender: gender || undefined,
        country: country || undefined
      };
      
      const success = await updateUserProfile(profileData);
      
      if (success) {
        await loadUserProfile();
        router.push('/register/goals');
      } else {
        setError('No se pudieron guardar los datos. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView
      className="flex-1 bg-black"
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
            <View className="items-center mb-8">
              <LogoTitle />
              <Text className="text-gray-500 mt-2">Paso 2 de 3</Text>
              <Text className="text-white text-lg font-semibold mt-4 text-center">¡Bienvenido a Ryko!</Text>
              <Text className="text-gray-400 text-center mt-2 px-6">
                Cuéntanos un poco sobre ti para personalizar tu experiencia. Estos datos se pueden editar después desde tu perfil.
              </Text>
            </View>

            <View className="flex-1 flex-col items-center">
              <View style={{
                width: '90%',
                maxWidth: 500,
                gap: 24,
              }}>

                <View>
                  <DatePickerField
                    label="Fecha de nacimiento *"
                    date={birthdate}
                    onChange={(date) => {
                      setBirthdate(date)
                      if (fieldErrors.birthdate) {
                        const newErrors = {...fieldErrors}
                        delete newErrors.birthdate
                        setFieldErrors(newErrors)
                      }
                    }}
                  />
                  {fieldErrors.birthdate && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{fieldErrors.birthdate}</Text>
                  )}
                </View>

                <FloatingLabelSelect
                  label="Género (opcional)"
                  value={gender}
                  onValueChange={setGender}
                  options={[
                    { label: 'Masculino', value: 'male' },
                    { label: 'Femenino', value: 'female' },
                    { label: 'Otro', value: 'other' },
                  ]}
                />

                <FloatingLabelSelect
                  label="País (opcional)"
                  value={country}
                  onValueChange={setCountry}
                  options={[
                    { label: 'España', value: 'es' },
                    { label: 'México', value: 'mx' },
                    { label: 'Argentina', value: 'ar' },
                  ]}
                />

                {error && (
                  <View className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                    <Text className="text-red-400 text-center">{error}</Text>
                  </View>
                )}

                <View className="space-y-2 mt-6">
                  <Pressable
                    onPress={handleNext}
                    disabled={!isStepValid || isLoading}
                    className="w-full py-4 items-center rounded-lg"
                    style={{
                      backgroundColor: isStepValid && !isLoading ? '#A3FF57' : '#A3F49D',
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000000" />
                    ) : (
                      <Text className={`font-bold text-lg ${isStepValid ? 'text-black' : 'text-gray-600'}`}>
                        Continuar
                      </Text>
                    )}
                  </Pressable>
                  
                  <Text className="text-gray-500 text-xs text-center mt-2">
                    * Campo obligatorio
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

