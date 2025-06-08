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
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FloatingLabelInput from '../../utils/FloatingLabel'
import FloatingLabelSelect from '../../utils/FloatingLabelSelect'
import FloatingLabelMultiSelect from '../../utils/FloatingLabelMultiSelect'
import { LogoTitle } from '../../utils/LogoTitle'

export default function RegisterGoals() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [aim, setAim] = useState<string | null>(null)
  const [calorieGoal, setCalorieGoal] = useState('')
  const [intolerances, setIntolerances] = useState<string[]>([])

  // Validación paso
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
                  value={weight}
                  onChangeText={setWeight}
                  inputProps={{ keyboardType: 'numeric' }}
                />

                <FloatingLabelInput
                  label="Altura (cm)"
                  value={height}
                  onChangeText={setHeight}
                  inputProps={{ keyboardType: 'numeric' }}
                />

                <FloatingLabelSelect
                  label="Objetivo"
                  value={aim}
                  onValueChange={setAim}
                  options={[
                    { label: 'Perder peso', value: 'weight_loss' },
                    { label: 'Mantener peso', value: 'weight_maintain' },
                    { label: 'Ganar peso', value: 'weight_gain' },
                  ]}
                />

                <FloatingLabelMultiSelect
                  label="Intolerancias"
                  values={intolerances}
                  onChangeValues={setIntolerances}
                  options={[
                    { label: 'Gluten', value: 'gluten' },
                    { label: 'Lactosa', value: 'lactosa' },
                    { label: 'Frutos secos', value: 'frutos_secos' },
                    { label: 'Mariscos', value: 'mariscos' },
                  ]}
                />

                <View className="space-y-2">
                  <Pressable
                    onPress={() => router.back()}
                    className="w-full py-3 items-center rounded border border-gray-700 mt-4 mb-2"
                  >
                    <Text className="text-gray-400">Atrás</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      if (!isStepValid) return
                      console.log({
                        weight,
                        height,
                        aim,
                        calorieGoal,
                        intolerances,
                      })
                      router.replace('/home')
                    }}
                    disabled={!isStepValid}
                    className="w-full py-3 items-center rounded"
                    style={{
                      backgroundColor: isStepValid ? '#A3FF57' : '#A3F49D',
                    }}
                  >
                    <Text
                      className={`font-bold ${isStepValid ? 'text-black' : 'text-gray-600'
                        }`}
                    >
                      Registrarse
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

