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

  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [aim, setAim] = useState<string | null>(null)
  const [calorieGoal, setCalorieGoal] = useState('')
  const [intolerances, setIntolerances] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})

  // Validación mejorada con mensajes específicos
  const validateFields = () => {
    const errors: {[key: string]: string} = {}
    
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const cg = parseInt(calorieGoal, 10)
    
    if (!weight || isNaN(w) || w <= 0) {
      errors.weight = 'El peso debe ser un número mayor a 0'
    } else if (w < 30 || w > 300) {
      errors.weight = 'El peso debe estar entre 30 y 300 kg'
    }
    
    if (!height || isNaN(h) || h <= 0) {
      errors.height = 'La altura debe ser un número mayor a 0'
    } else if (h < 100 || h > 250) {
      errors.height = 'La altura debe estar entre 100 y 250 cm'
    }
    
    if (!aim) {
      errors.aim = 'Debes seleccionar un objetivo'
    }
    
    if (!calorieGoal || isNaN(cg) || cg <= 0) {
      errors.calorieGoal = 'Las calorías deben ser un número mayor a 0'
    } else if (cg < 800 || cg > 5000) {
      errors.calorieGoal = 'Las calorías deben estar entre 800 y 5000'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const w = parseFloat(weight)
  const h = parseFloat(height)
  const cg = parseInt(calorieGoal, 10)
  const isStepValid =
    !isNaN(w) &&
    w > 0 &&
    !isNaN(h) &&
    h > 0 &&
    !!aim &&
    !isNaN(cg) &&
    cg > 0 &&
    Object.keys(fieldErrors).length === 0

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
    if (!validateFields()) return
    
    setIsLoading(true)
    setError(null)
    
    const updatedProfile = {
      ...profile,
      weight: parseInt(weight),
      height: parseInt(height),
      aim: aim || undefined,
      calorieGoal: parseInt(calorieGoal),
      intolerances,
      birthdate: profile.birthdate 
        ? (profile.birthdate instanceof Date 
            ? profile.birthdate.toISOString().split('T')[0] 
            : profile.birthdate)
        : undefined,
      gender: profile.gender || undefined,
      country: profile.country || undefined
    }
    
    try {
      const success = await updateUserProfile(updatedProfile)
      
      if (success) {
        router.replace('/home')
      } else {
        setError('No se pudo completar el registro. Inténtalo de nuevo.')
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
            <View className="items-center mb-8">
              <LogoTitle />
              <Text className="text-gray-500 mt-2">Paso 3 de 3</Text>
              <Text className="text-white text-lg font-semibold mt-4 text-center">¡Ya casi terminamos!</Text>
              <Text className="text-gray-400 text-center mt-2 px-6">
                Configura tus objetivos nutricionales. Podrás modificar estos datos más tarde desde tu perfil.
              </Text>
            </View>

            <View className="flex-1 flex-col items-center">
              <View style={{
                width: '90%',
                maxWidth: 500,
                gap: 24,
              }}>
                  <FloatingLabelInput
                    label="Peso (kg)"
                    value={weight}
                    onChangeText={(text) => {
                      setWeight(text)
                      if (fieldErrors.weight) {
                        const newErrors = {...fieldErrors}
                        delete newErrors.weight
                        setFieldErrors(newErrors)
                      }
                    }}
                    inputProps={{ keyboardType: 'numeric' }}
                  />
                  {fieldErrors.weight && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{fieldErrors.weight}</Text>
                  )}

                  <FloatingLabelInput
                    label="Altura (cm)"
                    value={height}
                    onChangeText={(text) => {
                      setHeight(text)
                      if (fieldErrors.height) {
                        const newErrors = {...fieldErrors}
                        delete newErrors.height
                        setFieldErrors(newErrors)
                      }
                    }}
                    inputProps={{ keyboardType: 'numeric' }}
                  />
                  {fieldErrors.height && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{fieldErrors.height}</Text>
                  )}

                  <FloatingLabelSelect
                    label="Objetivo"
                    value={aim}
                    onValueChange={(value) => {
                      setAim(value)
                      if (fieldErrors.aim) {
                        const newErrors = {...fieldErrors}
                        delete newErrors.aim
                        setFieldErrors(newErrors)
                      }
                    }}
                    options={[
                      { label: 'Perder peso', value: 'weight_loss' },
                      { label: 'Mantener peso', value: 'weight_maintain' },
                      { label: 'Ganar peso', value: 'weight_gain' },
                    ]}
                  />
                  {fieldErrors.aim && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{fieldErrors.aim}</Text>
                  )}

                  <FloatingLabelInput
                    label="Meta de calorías diarias"
                    value={calorieGoal}
                    onChangeText={(text) => {
                      setCalorieGoal(text)
                      if (fieldErrors.calorieGoal) {
                        const newErrors = {...fieldErrors}
                        delete newErrors.calorieGoal
                        setFieldErrors(newErrors)
                      }
                    }}
                    inputProps={{ keyboardType: 'numeric' }}
                  />
                  {fieldErrors.calorieGoal && (
                    <Text className="text-red-500 text-sm mt-1 ml-2">{fieldErrors.calorieGoal}</Text>
                  )}

                <FloatingLabelMultiSelect
                  label="Intolerancias (opcional)"
                  values={intolerances}
                  onChangeValues={setIntolerances}
                  options={[
                    { label: 'Gluten', value: 'gluten' },
                    { label: 'Lactosa', value: 'lactosa' },
                    { label: 'Frutos secos', value: 'frutos_secos' },
                    { label: 'Mariscos', value: 'mariscos' },
                  ]}
                />

                {error && (
                  <View className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                    <Text className="text-red-400 text-center">{error}</Text>
                  </View>
                )}

                <View className="space-y-2 mt-6">
                  <Pressable
                    onPress={handleRegister}
                    disabled={!isStepValid || isLoading}
                    className="w-full py-4 items-center rounded-lg"
                    style={{
                      backgroundColor: isStepValid && !isLoading ? '#A3FF57' : '#A3F49D',
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000000" />
                    ) : (
                      <Text
                        className={`font-bold text-lg ${isStepValid ? 'text-black' : 'text-gray-600'}`}
                      >
                        ¡Completar registro!
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

