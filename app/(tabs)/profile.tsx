import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { logout, getCurrentUser, User } from '../services/_auth';
import { getToken } from '../services/_storage';
import { getCurrentUserId, getUserProfile, updateUserProfile } from '../services/_user';
import { ProfileCard } from '../utils/_ProfileCard';
import { ProfileRow } from '../utils/_ProfileRow';
import { MacroSlider } from '../utils/_MacroSlider';
import { INTOLERANCES } from '../(config)/_intolerances';
import { GENDERS }    from '../(config)/_genders';
import { COUNTRIES }  from '../(config)/_countries';
import { UserProfileDto } from '../(types)/_UserProfileDto';
import { WEIGHT_AIMS } from '../(config)/_WeightAims';
import { THEME_COLORS } from '../(config)/_colors';

const CODE_TO_NAME = Object.fromEntries(
  COUNTRIES.map(c => [c.code, c.name])
) as Record<string,string>;
const NAME_TO_CODE = Object.fromEntries(
  COUNTRIES.map(c => [c.name, c.code])
) as Record<string,string>;

const AIM_CODE_TO_NAME = Object.fromEntries(
  WEIGHT_AIMS.map(a => [a.code, a.name])
) as Record<string,string>;
const AIM_NAME_TO_CODE = Object.fromEntries(
  WEIGHT_AIMS.map(a => [a.name, a.code])
) as Record<string,string>;

const MODAL_OPTIONS = {
  addIntolerance: { list: INTOLERANCES, multi: true },
  gender:         { list: GENDERS,        multi: false },
  country:        { list: COUNTRIES.map(c => c.name),      multi: false },
} as const;

const { width } = Dimensions.get('window');
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

import { useAuthStore } from '../(store)/authStore';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, setUser, logout: authLogout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    birthdate: '',
    gender: '',
    country: '',
    weight: '',
    height: '',
    aim: 'weight_maintain',
    calorieGoal: '',
    proteinPct: 30,
    carbsPct: 40,
    fatPct: 30,
    intolerances: [] as string[],
  });
  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [tempIntolerances, setTempIntolerances] = useState<string[]>([]);

  
  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = await getToken();
        if (token) {
          const userId = await getCurrentUserId();
          if (userId) {
            const fullProfile = await getUserProfile(userId);
            console.log('Datos del usuario:', fullProfile);
            console.log("cumpleaños:", fullProfile.birthdate)
            setUser(fullProfile);
            if (fullProfile) {
              setFormData(prev => ({
                ...prev,
                username: fullProfile?.username || '',
                email: fullProfile?.email || '',
                birthdate: fullProfile?.birthdate || '',
                gender: fullProfile?.gender ? (fullProfile.gender === 'male' ? 'Hombre' : fullProfile.gender === 'female' ? 'Mujer' : 'Otro') : '',
                country: fullProfile.country
                ? CODE_TO_NAME[fullProfile.country]
                : '',
                weight: fullProfile?.weight?.toString() || '',
                height: fullProfile?.height?.toString() || '',
                aim: fullProfile.aim
                ? AIM_CODE_TO_NAME[fullProfile.aim]
                : '',
                calorieGoal: fullProfile?.calorieGoal?.toString() || '',
                proteinPct: fullProfile?.proteinPct || 30,
                carbsPct: fullProfile?.carbsPct || 40,
                fatPct: fullProfile?.fatPct || 30,
                intolerances: fullProfile?.intolerances || []
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);
  
  const openModal = (type: string, currentValue = '') => {
    if (type === 'addIntolerance') {
      setTempIntolerances(formData.intolerances);
    } else if (type === 'gender') {
      setTempValue(formData.gender);
    } else if (type === 'country') {
      setTempValue(formData.country);
    } else {
      setTempValue(currentValue);
    }
    setActiveModal(type);
  };
  
  const closeModal = () => {
    Keyboard.dismiss();
    setActiveModal(null);
    setTempValue('');
  };

  const saveModalValue = () => {
    if (activeModal === 'birthDate') {
    if (!DATE_REGEX.test(tempValue)) {
      Alert.alert('Formato inválido', 'Usa AAAA-MM-DD (ej. 2001-05-23)');
      return;
    }

    const atMidnight = new Date(`${tempValue}T00:00:00.000Z`);
    if (isNaN(atMidnight.getTime())) {
      Alert.alert('Fecha inválida', 'Esa combinación día/mes no existe');
      return;
    }

    setFormData(prev => ({
      ...prev,
      birthdate: atMidnight.toISOString(), // "2001-05-23T00:00:00.000Z"
    }));
    closeModal();
    return;
  }

  if (activeModal === 'addIntolerance') {
    setFormData(prev => ({ ...prev, intolerances: tempIntolerances }));
  } else {
    setFormData(prev => ({ ...prev, [activeModal!]: tempValue }));
  }
  closeModal();
};
  
const updateMacro = (
  macro: 'proteinPct' | 'carbsPct' | 'fatPct',
  delta: number             
) => {
  setFormData(prev => {
    const newValue = Math.max(0, Math.min(100, prev[macro] + delta));
    return {
      ...prev,
      [macro]: newValue,     
    };
  });
};

  const removeIntolerance = (index: number) => {
    setFormData(prev => ({
      ...prev,
      intolerances: prev.intolerances.filter((_, i) => i !== index)
    }));
  };
  
  const mapGenderToApi = (g: string) =>
    g === 'Hombre' ? 'male'
    : g === 'Mujer' ? 'female'
    : 'other'; 


  const handleSave = async () => {
    setLoading(true);
    try {
      const dto: UserProfileDto = {
      username: formData.username,
      email: formData.email,
      birthdate: formData.birthdate,
      gender: mapGenderToApi(formData.gender),
      country: NAME_TO_CODE[formData.country],
      weight: parseInt(formData.weight),
      height: parseInt(formData.height),
      calorieGoal: parseInt(formData.calorieGoal),
      aim: AIM_NAME_TO_CODE[formData.aim],
      proteinPct: formData.proteinPct,
      carbsPct: formData.carbsPct,
      fatPct: formData.fatPct,
      intolerances: formData.intolerances
    };
    console.log("dto a guardar", dto);
    console.log("pcts:", formData.proteinPct, formData.carbsPct, formData.fatPct)
    const success = await updateUserProfile(dto);
    if (success) {
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 2000);
    } else {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // Modal content
  
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        birthdate: user.birthdate || '',
        gender: user.gender ? (user.gender === 'male' ? 'Hombre' : user.gender === 'female' ? 'Mujer' : 'Otro') : '',
        country: user.country ? CODE_TO_NAME[user.country] : '',
        weight: user.weight?.toString() || '',
        height: user.height?.toString() || '',
        aim: user.aim ? AIM_CODE_TO_NAME[user.aim] : '',
        calorieGoal: user.calorieGoal?.toString() || '',
        proteinPct: user.proteinPct || 30,
        carbsPct: user.carbsPct || 40,
        fatPct: user.fatPct || 30,
        intolerances: user.intolerances || []
      }));
    }
  }, [user]);
  
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      authLogout();
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const isSelected = (opt: string) =>
  activeModal === 'addIntolerance'
    ? tempIntolerances.includes(opt)
    : tempValue === opt;

const toggleOption = (opt: string) => {
  if (activeModal === 'addIntolerance') {
    setTempIntolerances(prev =>
      prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt]
    );
  } else {
    setTempValue(opt);
  }
};
  
  const macroTotal = formData.proteinPct + formData.carbsPct + formData.fatPct;
  const isMacroValid = macroTotal === 100;
  
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#A3FF57" />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Top Bar */}
      
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Profile Title*/}
        <Text style={{
          fontSize: width < 480 ? 20 : width < 768 ? 24 : 28,
          fontWeight: '600',
          color: '#FFFFFF',
          marginBottom: width < 480 ? 20 : 32
        }}>
          Perfil
        </Text>
        
        {/* Account Information Card */}
        <ProfileCard
          title="Información de cuenta"
        >
          <ProfileRow
            label="Nombre de usuario"
            value={formData.username}
            rightElement={<Ionicons name="pencil" size={18} color="#A3FF57" />}
            onPress={() => openModal('username', formData.username)}
          />
          <ProfileRow
            label="Email"
            value={formData.email}
            rightElement={<Ionicons name="copy-outline" size={18} color="#9CA3AF" />}
            onPress={() => {/* Copy email logic */}}
          />
        </ProfileCard>
        
        {/* Personal Data Card */}
        <ProfileCard
          title="Datos personales"
        >
          <ProfileRow
            label="Fecha de nacimiento"
            value={formData.birthdate ? formData.birthdate.slice(0, 10) : 'No especificada'}
            rightElement={<Ionicons name="pencil" size={18} color="#A3FF57" />}
            onPress={() => openModal('birthDate', formData.birthdate.slice(0, 10))}
          />
          <ProfileRow
            label="Género"
            value={formData.gender || 'No especificado'}
            rightElement={<Ionicons name="chevron-down" size={20} color="#FFFFFF" />}
            onPress={() => openModal('gender', formData.gender)}
          />
          <ProfileRow
            label="País"
            value={formData.country || 'No especificado'}
            rightElement={<Ionicons name="chevron-down" size={20} color="#FFFFFF" />}
            onPress={() => openModal('country', formData.country)}
          />
        </ProfileCard>
        
        {/* Body Composition Card */}
        <ProfileCard
          title="Composición corporal"
        >
          <ProfileRow
            label="Peso (kg)"
            value={formData.weight || 'No especificado'}
            rightElement={<Ionicons name="pencil" size={18} color="#A3FF57" />}
            onPress={() => openModal('weight', formData.weight)}
          />
          <ProfileRow
            label="Altura (cm)"
            value={formData.height || 'No especificada'}
            rightElement={<Ionicons name="pencil" size={18} color="#A3FF57" />}
            onPress={() => openModal('height', formData.height)}
          />
        </ProfileCard>
        
        {/* Nutritional Goal Card */}
        <ProfileCard
          title="Objetivo nutricional"
        >
          {/* Goal Chips */}
          <View className="mb-6">
            <Text className="text-gray-400 text-sm mb-3">Objetivo</Text>
            <View className="flex-row flex-wrap gap-2">
              {WEIGHT_AIMS.map(({ name }) => (
                <Pressable
                  key={name}
                  className={`px-4 py-2 rounded-full border ${
                    formData.aim === name
                      ? 'bg-[#A3FF57] border-[#A3FF57]'
                      : 'border-gray-600'
                  }`}
                  onPress={() =>
                    setFormData(prev => ({ ...prev, aim: name }))
                  }
                >
                  <Text className={`text-sm ${
                    formData.aim === name
                      ? 'text-black font-medium'
                      : 'text-white'
                  }`}>
                    {name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          
          {/* Target Calories */}
          <ProfileRow
            label="Meta calórica (kcal)"
            value={formData.calorieGoal}
            onPress={() => openModal('calorieGoal', formData.calorieGoal)}
          />
          
          {/* Macro Split */}
          <View className="mt-6">
            <View className="flex-row items-center mb-3">
              <Text className="text-gray-400 text-sm">Distribución de macros</Text>
              <Pressable className="ml-2">
                <Ionicons name="information-circle-outline" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
            
            <View className="space-y-4">
              <MacroSlider
                label="Proteína"
                value={formData.proteinPct}
                onChange={delta => updateMacro('proteinPct', delta)}
                color={THEME_COLORS.macros.protein}
              />
              <MacroSlider
                label="Carbohidratos"
                value={formData.carbsPct}
                onChange={delta => updateMacro('carbsPct', delta)}
                color={THEME_COLORS.macros.carbs}
              />
              <MacroSlider
                label="Grasas"
                value={formData.fatPct}
                onChange={delta => updateMacro('fatPct', delta)}
                color={THEME_COLORS.macros.fat}
              />
            </View>
            
            <View className="mt-4 flex-row justify-center">
              <Text className={`text-sm font-medium ${
                isMacroValid ? 'text-[#A3FF57]' : 'text-[#FF4D4F]'
              }`}>
                Total: {macroTotal}%
              </Text>
            </View>
            
            {!isMacroValid && (
              <Text className="text-[#FF4D4F] text-xs text-center mt-2">
                Los porcentajes deben sumar 100%
              </Text>
            )}
          </View>
        </ProfileCard>
        
        {/* Intolerances Card */}
        <ProfileCard
          title="Intolerancias"
        >
          <View className="flex-row flex-wrap gap-2 mb-4">
            {formData.intolerances.map((intolerance, index) => (
              <View key={index} className="bg-gray-800 px-3 py-2 rounded-full flex-row items-center">
                <Text className="text-white text-sm mr-2">{intolerance}</Text>
                <Pressable onPress={() => removeIntolerance(index)}>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
            <Pressable
              className="border border-[#A3FF57] px-3 py-2 rounded-full"
              onPress={() => openModal('addIntolerance')}
            >
              <Text className="text-[#A3FF57] text-sm">+ Añadir</Text>
            </Pressable>
          </View>
        </ProfileCard>
        
        {/* Bottom spacing */}
        <View className="h-32" />
      </ScrollView>
      
      {/* Sticky Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-6 py-4">
        <Pressable
          className="bg-[#A3FF57] py-3 rounded-2xl mb-3"
          onPress={handleSave}
        >
          <Text className="text-black text-center font-semibold text-base">Guardar cambios</Text>
        </Pressable>
        
        <Pressable
          className="border border-[#FF4D4F] py-3 rounded-2xl mb-2"
          onPress={handleLogout}
        >
          <Text className="text-[#FF4D4F] text-center font-medium text-base">Cerrar sesión</Text>
        </Pressable>
      </View>
      
      {/* Snackbar */}
      {showSnackbar && (
        <View className="absolute top-20 left-6 right-6 bg-[#A3FF57] px-4 py-3 rounded-2xl flex-row items-center justify-center">
          <Text className="text-black font-medium mr-2">Cambios guardados</Text>
        </View>
      )}
      
      {/* Modal */}
      <Modal
        visible={activeModal !== null}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        {/* KeyboardAvoidingView */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-zinc-900 rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-lg font-semibold">Editar</Text>
                <Pressable onPress={closeModal}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </Pressable>
              </View>
              
        {MODAL_OPTIONS[activeModal as keyof typeof MODAL_OPTIONS] ? (
          MODAL_OPTIONS[activeModal as keyof typeof MODAL_OPTIONS].list.map(opt => {
            const selected = isSelected(opt);
            return (
              <Pressable
                key={opt}
                className={`flex-row items-center p-3 rounded-2xl mb-2 ${
                  selected ? 'bg-[#A3FF57]' : 'bg-[#2D2D30]'
                }`}
                onPress={() => toggleOption(opt)}
              >
                <Text className={`text-base ${selected ? 'text-black font-semibold' : 'text-white'}`}>
                  {opt}
                </Text>
              </Pressable>
            );
          })
        ) : (
            <TextInput
              className="bg-[#2D2D30] text-white p-4 rounded-2xl mb-4"
              value={tempValue}
              onChangeText={setTempValue}
              placeholder={activeModal === 'birthDate' ? 'YYYY-MM-DD' : 'Ingresa el valor'}
              keyboardType={activeModal === 'birthDate' ? 'numeric' : 'default'}
              placeholderTextColor="#666"
              autoFocus
            />
          )
        }

        <Pressable onPress={saveModalValue}>
        </Pressable>
                <Pressable
                  className="bg-[#A3FF57] py-3 rounded-2xl"
                  onPress={saveModalValue}
                >
                  <Text className="text-black text-center font-semibold">Guardar</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      {/* Confirmation logout modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-zinc-800 rounded-lg p-6 mx-4 max-w-sm w-full">
            <Text className="text-white text-lg font-bold mb-2">Cerrar sesión</Text>
            <Text className="text-zinc-300 mb-6">
              ¿Estás seguro de que quieres cerrar sesión?
            </Text>
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={cancelLogout}
                className="px-4 py-2 rounded bg-zinc-600 mr-3"
              >
                <Text className="text-white">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmLogout}
                className="px-4 py-2 rounded bg-red-600"
              >
                <Text className="text-white font-bold">Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Existence modal */}
      <Modal
        visible={activeModal !== null}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        {/* KeyboardAvoidingView */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-zinc-900 rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-lg font-semibold">Editar</Text>
                <Pressable onPress={closeModal}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </Pressable>
              </View>
              
        {MODAL_OPTIONS[activeModal as keyof typeof MODAL_OPTIONS] ? (
          MODAL_OPTIONS[activeModal as keyof typeof MODAL_OPTIONS].list.map(opt => {
            const selected = isSelected(opt);
            return (
              <Pressable
                key={opt}
                className={`flex-row items-center p-3 rounded-2xl mb-2 ${
                  selected ? 'bg-[#A3FF57]' : 'bg-[#2D2D30]'
                }`}
                onPress={() => toggleOption(opt)}
              >
                <Text className={`text-base ${selected ? 'text-black font-semibold' : 'text-white'}`}>
                  {opt}
                </Text>
              </Pressable>
            );
          })
        ) : (
            <TextInput
              className="bg-[#3D3D40] text-white p-4 rounded-2xl mb-4"
              value={tempValue}
              onChangeText={setTempValue}
              placeholder={activeModal === 'birthDate' ? 'YYYY-MM-DD' : 'Ingresa el valor'}
              keyboardType={activeModal === 'birthDate' ? 'numeric' : 'default'}
              placeholderTextColor="#666"
              autoFocus
            />
          )
        }

        <Pressable onPress={saveModalValue}>
           </Pressable>
                <Pressable
                  className="bg-[#A3FF57] py-3 rounded-2xl"
                  onPress={saveModalValue}
                >
                  <Text className="text-black text-center font-semibold">Guardar</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
    </SafeAreaView>
  );
}
