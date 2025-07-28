import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import FloatingLabelInput from '../utils/_FloatingLabel';
import api from '../api/client';

interface Food {
  id: string;
  name: string;
  brand?: string;
  carbohydrates: number,
  fat: number,
  protein: number,
}
interface Ingredient extends Food { quantity: number; }
interface DishFormData { name: string; description: string; image: string | null; ingredients: Ingredient[]; }

export default function CreateDishScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [formData, setFormData] = useState<DishFormData>({ name: '', description: '', image: null, ingredients: [] });
  const [errors, setErrors] = useState({ name: '' });
  const [showToast, setShowToast] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  const searchSheetRef = useRef<BottomSheetModal>(null);
  const qtySheetRef = useRef<BottomSheetModal>(null);
  const snapSearch = useMemo(() => ['50%'], []);
  const snapQty = useMemo(() => ['30%'], []);
  const [selected, setSelected] = useState<Ingredient | null>(null);

  const totalMacros = useMemo(
    () => formData.ingredients.reduce(
      (acc, ing) => {
        const r = ing.quantity / 100;
        return { carbs: acc.carbs + ing.carbohydrates * r, protein: acc.protein + ing.protein * r, fat: acc.fat + ing.fat * r };
      }, { carbs: 0, protein: 0, fat: 0 }
    ), [formData.ingredients]
  );
  
  const valid = formData.name.trim() !== '' && formData.ingredients.length > 0;

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [16, 9], quality: 0.8 });
    if (!result.canceled) setFormData(d => ({ ...d, image: result.assets[0].uri }));
  };

  const fetchFoods = async (q: string) => {
    setLoading(true);
    try {
      const { data } = await api.get<Food[]>('/fooditems', {
        params: { name: q }
      });
      setResults(data);
    } catch (error) {
      console.error('Error fetching foods:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la búsqueda manual únicamente
  const handleSearch = () => {
    if (searchQuery.trim().length >= 2) {
      fetchFoods(searchQuery.trim());
      searchSheetRef.current?.present();
    }
  };

  // Función para abrir el modal de búsqueda
  const openSearchModal = () => {
    searchSheetRef.current?.present();
  };

  const addIngredient = (food: Food) => { 
    setFormData(d => ({ ...d, ingredients: [...d.ingredients, { ...food, quantity: 100 }] }));
    searchSheetRef.current?.close(); 
    setSearchQuery('');
    setResults([]);
  };

  const onChipPress = (ing: Ingredient) => { 
    setSelected(ing);
    qtySheetRef.current?.present();
  };

  const changeQty = (delta: number) => { 
    if (!selected) return;
     setSelected({ ...selected, quantity: Math.max(5, selected.quantity + delta) });
  };

  const saveQty = () => { 
    if (!selected) return; 
    setFormData(d => ({ ...d, ingredients: d.ingredients.map(i => i.id === selected.id ? selected : i) })); 
    qtySheetRef.current?.close(); 
  };

  const saveDish = () => { if (!valid) { 
    if (!formData.name.trim()) setErrors({ name: 'Requerido' }); return; 
    } 
    setShowToast(true); 
    setTimeout(() => { 
      setShowToast(false); 
      router.back(); 
    },
     2000); 
  };

  const MiniDonut = ({ onPress }: { onPress: () => void }) => {
    const size = 60, t = totalMacros, tot = t.carbs + t.fat + t.protein || 1;
    const steps = [t.carbs, t.fat, t.protein].map(v => (v / tot) * 360);
    let start = 0;
    return (
      <Pressable onPress={onPress} className="items-center justify-center">
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        </Svg>
      </Pressable>
    );
  };

  return (
    <BottomSheetModalProvider>
      <SafeAreaView className={`flex-1 bg-slate-900 pt-${insets.top}`}>        
        <View className="flex-row items-center justify-between px-4 py-4">
          <Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="white" /></Pressable>
          <Text className="text-lg font-semibold text-white">Crear Plato</Text>
          <View className="w-6" />
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView className="px-4 pb-20" showsVerticalScrollIndicator={false}>
            {/* Nombre */}
            <View className="bg-slate-800 p-4 rounded-2xl mb-4">
              <Text className="text-slate-300 mb-2">Nombre</Text>
              <TextInput
                value={formData.name}
                onChangeText={text => {
                  setFormData(d => ({ ...d, name: text }));
                  if (text.trim()) setErrors({ name: '' });
                }}
                onBlur={() => {
                  if (!formData.name.trim()) setErrors({ name: 'Requerido' });
                }}
                className="bg-slate-900 rounded-lg p-3 text-white text-lg"
                style={{
                  fontSize: 18,
                  color: '#ffffff',
                }}
                placeholderTextColor="#9ca3af"
                placeholder="Nombre del plato..."
              />
              {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>}
            </View>
            {/* Descripción */}
            <View className="bg-slate-800 p-4 rounded-2xl mb-4">
              <Text className="text-slate-300 mb-2">Descripción</Text>
              <TextInput
                value={formData.description}
                onChangeText={text => setFormData(d => ({ ...d, description: text }))}
                multiline
                numberOfLines={4}
                className="bg-slate-900 rounded-lg p-3 text-white text-lg"
                style={{
                  minHeight: 100,
                  textAlignVertical: 'top',
                  fontSize: 18,
                  color: '#ffffff',
                }}
                placeholderTextColor="#9ca3af"
                placeholder="Describe tu plato..."
              />
            </View>
            {/* Imagen */}
            <View className="bg-slate-800 p-4 rounded-2xl mb-4">
              <Text className="text-slate-300 mb-2">Imagen</Text>
              <Pressable className="h-40 border-2 border-dashed border-slate-600 rounded-2xl items-center justify-center" onPress={pickImage}>
                {formData.image ? <Image source={{ uri: formData.image }} className="w-full h-full rounded-2xl" /> : <Ionicons name="add" size={32} color="#A3FF57" />}
              </Pressable>
            </View>
            {/* Búsqueda */}
            <View className="bg-slate-800 p-4 rounded-2xl mb-4">
              <Text className="text-slate-300 mb-2">Buscar alimento</Text>
              <View className="flex-row items-center">
                <View className="flex-1 mr-2">
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="bg-slate-900 rounded-lg p-3 text-white text-lg"
                    style={{
                      fontSize: 16,
                      color: '#ffffff',
                    }}
                    placeholderTextColor="#9ca3af"
                    placeholder="Escribe el nombre del alimento..."
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                  />
                </View>
                <Pressable 
                  className="bg-[#A3FF57] rounded-lg p-3"
                  onPress={handleSearch}
                  disabled={searchQuery.trim().length < 2}
                >
                  <Ionicons name="search" size={20} color="black" />
                </Pressable>
              </View>
            </View>
            {/* Ingredientes */}
            {formData.ingredients.length > 0 && (
              <View className="bg-slate-800 p-4 rounded-2xl mb-4">
                <Text className="text-slate-300 mb-2">Ingredientes</Text>
                <View className="flex-row flex-wrap">
                  {formData.ingredients.map(ing => (
                    <Pressable key={ing.id} className="bg-slate-700 px-3 py-1 rounded-full mr-2 mb-2" onPress={() => onChipPress(ing)}>
                      <Text className="text-white text-sm">{ing.name} ({ing.quantity}g)</Text>
                    </Pressable>
                  ))}
                </View>
                <View className="items-center mt-4">
                  <MiniDonut onPress={() => {}} />
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
        {/* Botón Guardar */}
        <View className="absolute bottom-0 left-0 right-0 bg-slate-900 bg-opacity-90 p-4">
          <Pressable className={`w-full py-4 rounded-2xl items-center ${valid ? 'bg-[#A3FF57]' : 'bg-slate-700'}`} onPress={saveDish} disabled={!valid}>
            <Text className="text-white font-semibold text-lg">Guardar Plato</Text>
          </Pressable>
        </View>
        {/* Toast */}
        {showToast && (
          <View className="absolute top-20 left-4 right-4 bg-green-500 rounded-lg p-3 items-center">
            <Text className="text-white font-medium">¡Plato creado!</Text>
          </View>
        )}
        {/* BottomSheet - Buscar */}
        <BottomSheetModal ref={searchSheetRef} index={0} snapPoints={snapSearch} backgroundStyle={{ backgroundColor: '#1e293b' }} handleIndicatorStyle={{ backgroundColor: '#64748B', width: 40 }}>
          <View className="p-4">
            <Text className="text-white text-lg mb-4">Buscar alimentos</Text>
            <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Escribe para buscar..." placeholderTextColor="#64748B" className="bg-slate-700 rounded-lg px-3 py-2 text-white mb-4" />
            {loading ? <ActivityIndicator color="#A3FF57" /> : (
              <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {results.length === 0 && searchQuery.length >= 2 ? (
                  <Text className="text-slate-400 text-center py-4">No se encontraron alimentos</Text>
                ) : (
                  results.map(food => (
                    <Pressable key={food.id} className="flex-row justify-between items-center bg-slate-800 rounded-lg p-3 mb-2" onPress={() => addIngredient(food)}>
                      <View className="flex-1">
                        <Text className="text-white">{food.name}</Text>
                        {food.brand && <Text className="text-slate-400 text-sm">{food.brand}</Text>}
                        {food.carbohydrates && food.protein && food.fat && (
                          <Text className="text-slate-500 text-xs mt-1">
                            C: {food.carbohydrates}g | P: {food.protein}g | G: {food.fat}g
                          </Text>
                        )}
                      </View>
                      <Ionicons name="add-circle" size={24} color="#A3FF57" />
                    </Pressable>
                  ))
                )}
              </BottomSheetScrollView>
            )}
          </View>
        </BottomSheetModal>
        {/* BottomSheet - Cantidad */}
        <BottomSheetModal ref={qtySheetRef} index={0} snapPoints={snapQty} backgroundStyle={{ backgroundColor: '#1e293b' }} handleIndicatorStyle={{ backgroundColor: '#64748B', width: 40 }}>
          {selected && (
            <View className="p-4">
              <Text className="text-white text-lg mb-4">{selected.name}</Text>
              <View className="flex-row items-center justify-center mb-6">
                <Pressable className="bg-slate-700 rounded-full p-2" onPress={() => changeQty(-10)}><Ionicons name="remove" size={20} color="white" /></Pressable>
                <Text className="text-white text-2xl mx-4">{selected.quantity} g</Text>
                <Pressable className="bg-slate-700 rounded-full p-2" onPress={() => changeQty(10)}><Ionicons name="add" size={20} color="white" /></Pressable>
              </View>
              <View className="flex-row justify-between">
                <Pressable className="flex-row items-center" onPress={() => { setFormData(d => ({ ...d, ingredients: d.ingredients.filter(i => i.id !== selected.id) })); qtySheetRef.current?.close(); }}>
                  <Ionicons name="trash" size={20} color="#FF4D4F" />
                  <Text className="text-red-500 ml-2">Eliminar</Text>
                </Pressable>
                <Pressable className="bg-[#A3FF57] px-6 py-2 rounded-2xl" onPress={saveQty}>
                  <Text className="text-black font-semibold">OK</Text>
                </Pressable>
              </View>
            </View>
          )}
        </BottomSheetModal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
}

