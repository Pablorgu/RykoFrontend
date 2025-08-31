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

  const isStepValid = !!birthdate

  const fade = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleNext = async () => {
    if (!isStepValid) return
    
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
        // Update user profile in store
        await loadUserProfile();
        router.push('/register/goals');
      } else {
        setError('No se pudieron guardar los datos personales. Inténtalo de nuevo.');
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
            <View className="items-center mb-20">
              <LogoTitle />
              <Text className="text-gray-500 mt-2">Paso 2 de 3</Text>
            </View>

            <View className="flex-1 flex-col items-center">
              <View style={{
                width: '90%',
                maxWidth: 500,
                gap: 24,
              }}>

                <DatePickerField
                  label="Fecha de nacimiento"
                  date={birthdate}
                  onChange={setBirthdate}
                />

                <FloatingLabelSelect
                  label="Género"
                  value={gender}
                  onValueChange={setGender}
                  options={[
                    { label: 'Masculino', value: 'male' },
                    { label: 'Femenino', value: 'female' },
                    { label: 'Otro', value: 'other' },
                  ]}
                />

                <FloatingLabelSelect
                  label="País"
                  value={country}
                  onValueChange={setCountry}
                  options={[
                    { label: 'España', value: 'es' },
                    { label: 'México', value: 'mx' },
                    { label: 'Argentina', value: 'ar' },
                    // …
                  ]}
                />

                <View className="space-y-2">
                  <Pressable
                    onPress={() => router.back()}
                    className="w-full py-3 my-2 items-center rounded border border-gray-700"
                  >
                    <Text className="text-gray-400">Atrás</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleNext}
                    disabled={!isStepValid}
                    className="w-full py-3 items-center rounded"
                    style={{
                      backgroundColor: isStepValid ? '#A3FF57' : '#A3F49D',
                    }}
                  >
                    <Text className={`font-bold ${isStepValid ? 'text-black' : 'text-gray-600'}`}>
                      Siguiente
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

