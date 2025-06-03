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
import { LogoTitle } from '../../utils/LogoTitle'
import { DatePickerField } from '../../utils/DateTimePicker'

export default function RegisterPersonal() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState<Date | null>(null)
  const [gender, setGender] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)

  const isStepValid = name.trim().length > 0 && !!birthdate

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
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ flex: 1, opacity: fade, paddingVertical: 20 }}>
            <View className="items-center mb-20">
              <LogoTitle />
              <Text className="text-gray-500 mt-2">Paso 2 de 4</Text>
            </View>

            <View className="flex-1 flex-col items-center">
              <View className="w-[90%] max-w-[500px] space-y-4">
                <FloatingLabelInput
                  label="Nombre completo"
                  value={name}
                  onChangeText={setName}
                />

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

                <View className="space-y-2 mt-4">
                  <Pressable
                    onPress={() => router.back()}
                    className="w-full py-3 items-center rounded border border-gray-700"
                  >
                    <Text className="text-gray-400">Atrás</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => isStepValid && router.push('/register/Measurements')}
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

