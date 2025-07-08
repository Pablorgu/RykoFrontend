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
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FloatingLabelInput from '../../utils/_FloatingLabel'
import FloatingLabelSelect from '../../utils/_FloatingLabelSelect'
import FloatingLabelMultiSelect from '../../utils/_FloatingLabelMultiSelect'
import { LogoTitle } from '../../utils/_LogoTitle'
import { useUserProfile } from '../../context/UserProfileContext'
import { updateUserProfile } from '../../services/_user'

export default function RegisterGoals() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { profile} = useUserProfile()

  const [peso, setWeight] = useState('')
  const [altura, setHeight] = useState('')
  const [objetivo, setAim] = useState<string | null>(null)
  const [calorias, setCalorieGoal] = useState('')
  const [intolerancias, setIntolerances] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validación paso
  const w = parseFloat(peso)
  const h = parseFloat(altura)
  const cg = parseInt(calorias, 10)
  const isStepValid =
    !isNaN(w) &&
    w > 0 &&
    !isNaN(h) &&
    h > 0 &&
    !!objetivo &&
    !isNaN(cg) &&
    cg > 0

  // Animated fade-in
  const fade = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleRegister = async () => {
    if (!isStepValid) return
    
    setIsLoading(true)
    setError(null)
    
    const updatedProfile = {
      ...profile,
      peso,
      altura,
      objetivo,
      calorias,
      intolerancias
    }
    console.log('Perfil actualizado:', updatedProfile)
    
    try {
      const success = await updateUserProfile(updatedProfile)
      
      if (success) {
        router.replace('/home')
      } else {
        setError('No se pudo actualizar el perfil. Inténtalo de nuevo.')
      }
    } catch (err) {
      console.error('Error en registro:', err)
      setError('Ocurrió un error durante el registro. Inténtalo de nuevo.')
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
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ flex: 1, opacity: fade, paddingVertical: 20 }}>
            <View className="items-center mb-20">
              <LogoTitle />
              <Text className="text-gray-500 mt-2">Paso 3 de 3</Text>
            </View>

            <View className="flex-1 flex-col items-center">
              <View style={{
                width: '90%',
                maxWidth: 500,
                gap: 24,
              }}>
                <FloatingLabelInput
                  label="Peso (kg)"
                  value={peso}
                  onChangeText={setWeight}
                  inputProps={{ keyboardType: 'numeric' }}
                />

                <FloatingLabelInput
                  label="Altura (cm)"
                  value={altura}
                  onChangeText={setHeight}
                  inputProps={{ keyboardType: 'numeric' }}
                />

                <FloatingLabelSelect
                  label="Objetivo"
                  value={objetivo}
                  onValueChange={setAim}
                  options={[
                    { label: 'Perder peso', value: 'weight_loss' },
                    { label: 'Mantener peso', value: 'weight_maintain' },
                    { label: 'Ganar peso', value: 'weight_gain' },
                  ]}
                />

                <FloatingLabelInput
                  label="Meta de calorías diarias"
                  value={calorias}
                  onChangeText={setCalorieGoal}
                  inputProps={{ keyboardType: 'numeric' }}
                />

                <FloatingLabelMultiSelect
                  label="Intolerancias"
                  values={intolerancias}
                  onChangeValues={setIntolerances}
                  options={[
                    { label: 'Gluten', value: 'gluten' },
                    { label: 'Lactosa', value: 'lactosa' },
                    { label: 'Frutos secos', value: 'frutos_secos' },
                    { label: 'Mariscos', value: 'mariscos' },
                  ]}
                />

                {error && (
                  <Text className="text-red-500 text-center">{error}</Text>
                )}

                <View className="space-y-2">
                  <Pressable
                    onPress={() => router.back()}
                    className="w-full py-3 items-center rounded border border-gray-700 mt-4 mb-2"
                  >
                    <Text className="text-gray-400">Atrás</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleRegister}
                    disabled={!isStepValid || isLoading}
                    className="w-full py-3 items-center rounded"
                    style={{
                      backgroundColor: isStepValid && !isLoading ? '#A3FF57' : '#A3F49D',
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000000" />
                    ) : (
                      <Text
                        className={`font-bold ${isStepValid ? 'text-black' : 'text-gray-600'}`}
                      >
                        Registrarse
                      </Text>
                    )}
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

