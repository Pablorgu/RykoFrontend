import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
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
  Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import api from '../api/client';

interface Food {
  barcode: any;
  name: string;
  brand?: string;
  carbohydrates: number,
  fat: number,
  proteins: number,
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
        return { carbs: acc.carbs + ing.carbohydrates * r, proteins: acc.proteins + ing.proteins * r, fat: acc.fat + ing.fat * r };
      }, { carbs: 0, proteins: 0, fat: 0 }
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
      // Primero abrir el bottom sheet
      searchSheetRef.current?.present();
      // Luego iniciar la búsqueda
      fetchFoods(searchQuery.trim());
    }
  };

  // Mantener la función original sin búsqueda automática
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    // Solo limpiar resultados si se borra todo, pero no hacer búsqueda automática
    if (text.trim().length === 0) {
      setResults([]);
    }
  };

  const addIngredient = (food: Food) => { 
    // Crear un ingrediente único usando el barcode como identificador
    const newIngredient = {
      ...food,
      quantity: 100,
      // Si el mismo barcode ya existe, generar una instancia única
      barcode: formData.ingredients.some(ing => ing.barcode === food.barcode) 
        ? `${food.barcode}-${Date.now()}` 
        : food.barcode
    };
    
    setFormData(d => ({ 
      ...d, 
      ingredients: [...d.ingredients, newIngredient] 
    }));
    
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
    setFormData(d => ({ ...d, ingredients: d.ingredients.map(i => i.barcode === selected.barcode ? selected : i) })); 
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
    const size = 60, t = totalMacros, tot = t.carbs + t.fat + t.proteins || 1;
    const steps = [t.carbs, t.fat, t.proteins].map(v => (v / tot) * 360);
    let start = 0;
    return (
      <Pressable onPress={onPress} className="items-center justify-center">
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        </Svg>
      </Pressable>
    );
  };

  const updateIngredientQuantity = useCallback((ingredientId: string, newQuantity: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.barcode === ingredientId ? { ...ing, quantity: Math.round(newQuantity) } : ing
      )
    }));
  }, []);
  
  const removeIngredient = useCallback((ingredientId: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.barcode !== ingredientId)
    }));
  }, []);
  
  // Componente optimizado para ingrediente
  const IngredientItem = React.memo(({ ingredient, index }: { ingredient: Ingredient; index: number }) => {
  // Estado completamente independiente para cada slider
  const [sliderValue, setSliderValue] = useState(ingredient.quantity);
  const [isSliding, setIsSliding] = useState(false);
  
  // Solo sincronizar cuando el ingrediente cambie desde fuera Y no estemos deslizando
  useEffect(() => {
    if (!isSliding) {
      setSliderValue(ingredient.quantity);
    }
  }, [ingredient.quantity, isSliding]);
  
  // Usar el valor del slider para los cálculos en tiempo real
  const displayQuantity = isSliding ? sliderValue : ingredient.quantity;
  const ratio = displayQuantity / 100;
  const carbs = (ingredient.carbohydrates * ratio).toFixed(1);
  const protein = (ingredient.proteins * ratio).toFixed(1);
  const fat = (ingredient.fat * ratio).toFixed(1);
  
  const handleSliderStart = useCallback(() => {
    setIsSliding(true);
  }, []);
  
  const handleSliderChange = useCallback((value: number) => {
    setSliderValue(value);
  }, []);
  
  const handleSliderComplete = useCallback((value: number) => {
    const roundedValue = Math.round(value);
    setSliderValue(roundedValue);
    setIsSliding(false);
    updateIngredientQuantity(ingredient.barcode, roundedValue);
  }, [ingredient.barcode]);
  
  const handleRemove = useCallback(() => {
    removeIngredient(ingredient.barcode);
  }, [ingredient.barcode]);
  
  return (
    <View className="bg-slate-700 rounded-xl p-4 mb-3 shadow-lg">
      {/* Header con nombre y botón eliminar */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1">
          <Text className="text-white font-semibold text-lg">{ingredient.name}</Text>
          {ingredient.brand && (
            <Text className="text-slate-400 text-sm mt-1">{ingredient.brand}</Text>
          )}
        </View>
        <Pressable 
          onPress={handleRemove}
          className="bg-red-500 rounded-full p-2.5 shadow-md"
          style={{ elevation: 3 }}
        >
          <Ionicons name="trash" size={16} color="white" />
        </Pressable>
      </View>
      
      {/* Slider de cantidad con diseño moderno */}
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-slate-300 text-sm font-medium">Cantidad</Text>
          <View className="bg-[#A3FF57] px-3 py-1 rounded-full">
            <Text className="text-black font-bold text-sm">{Math.round(displayQuantity)}g</Text>
          </View>
        </View>
        
        {/* Slider con key única y eventos separados */}
        <View className="bg-slate-600 rounded-full p-1">
          <Slider
            key={`independent-slider-${ingredient.barcode}-${ingredient.name}-${index}`}
            style={{ width: '100%', height: 40 }}
            minimumValue={5}
            maximumValue={500}
            value={sliderValue}
            onSlidingStart={handleSliderStart}
            onValueChange={handleSliderChange}
            onSlidingComplete={handleSliderComplete}
            minimumTrackTintColor="#A3FF57"
            maximumTrackTintColor="#475569"
            thumbTintColor="#A3FF57"
            step={5}
          />
        </View>
      </View>
      
      {/* Macros con badges de colores */}
      <View className="flex-row justify-between bg-slate-800 rounded-lg p-3">
        <View className="items-center flex-1">
          <View className="bg-[#A3FF57] rounded-full px-2 py-1 mb-1">
            <Text className="text-black text-xs font-bold">C</Text>
          </View>
          <Text className="text-white font-semibold text-sm">{carbs}g</Text>
        </View>
        <View className="items-center flex-1">
          <View className="bg-[#4DABF7] rounded-full px-2 py-1 mb-1">
            <Text className="text-white text-xs font-bold">P</Text>
          </View>
          <Text className="text-white font-semibold text-sm">{protein}g</Text>
        </View>
        <View className="items-center flex-1">
          <View className="bg-[#FFB84D] rounded-full px-2 py-1 mb-1">
            <Text className="text-white text-xs font-bold">G</Text>
          </View>
          <Text className="text-white font-semibold text-sm">{fat}g</Text>
        </View>
      </View>
    </View>
  );
});

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
                <Text className="text-slate-300 mb-4 text-lg font-semibold">Ingredientes</Text>
                {formData.ingredients.map((ingredient, index) => (
                  <IngredientItem 
                    key={`ingredient-${ingredient.barcode}-${index}`} 
                    ingredient={ingredient} 
                    index={index} 
                  />
                ))}
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
        <BottomSheetModal 
          ref={searchSheetRef} 
          index={0} 
          snapPoints={snapSearch} 
          backgroundStyle={{ backgroundColor: '#1e293b' }} 
          handleIndicatorStyle={{ backgroundColor: '#64748B', width: 40 }}
        >
          <View className="p-4 flex-1">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-lg font-semibold">Buscar alimentos</Text>
              {loading && (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#A3FF57" size="small" />
                  <Text className="text-[#A3FF57] text-sm ml-2">Buscando...</Text>
                </View>
              )}
            </View>
            
            <TextInput 
              value={searchQuery} 
              onChangeText={setSearchQuery} 
              placeholder="Escribe para buscar..." 
              placeholderTextColor="#64748B" 
              className="bg-slate-700 rounded-lg px-3 py-3 text-white mb-4" 
              style={{
                fontSize: 16,
                color: '#ffffff',
              }}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <View className="bg-slate-800 rounded-2xl p-8 items-center">
                  <ActivityIndicator color="#A3FF57" size="large" />
                  <Text className="text-white text-base mt-4 font-medium">Buscando ingredientes...</Text>
                  <Text className="text-slate-400 text-sm mt-2 text-center">
                    Estamos encontrando los mejores resultados para "{searchQuery}"
                  </Text>
                </View>
              </View>
            ) : results.length === 0 && searchQuery.length >= 2 ? (
              <View className="flex-1 justify-center items-center">
                <View className="bg-slate-800 rounded-2xl p-8 items-center">
                  <Ionicons name="search-outline" size={48} color="#64748B" />
                  <Text className="text-slate-400 text-base mt-4 font-medium">No se encontraron alimentos</Text>
                  <Text className="text-slate-500 text-sm mt-2 text-center">
                    Intenta con otro término de búsqueda
                  </Text>
                </View>
              </View>
            ) : searchQuery.length < 2 ? (
              <View className="flex-1 justify-center items-center">
                <View className="bg-slate-800 rounded-2xl p-8 items-center">
                  <Ionicons name="restaurant-outline" size={48} color="#64748B" />
                  <Text className="text-slate-400 text-base mt-4 font-medium">Escribe al menos 2 caracteres</Text>
                  <Text className="text-slate-500 text-sm mt-2 text-center">
                    Para comenzar a buscar ingredientes
                  </Text>
                </View>
              </View>
            ) : (
              <BottomSheetFlatList
                data={results}
                keyExtractor={(item) => item.barcode}
                renderItem={({ item: food }) => (
                  <Pressable 
                    className="flex-row justify-between items-center bg-slate-800 rounded-xl p-4 mb-3 shadow-sm" 
                    onPress={() => addIngredient(food)}
                    style={{ elevation: 2 }}
                  >
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-base">{food.name}</Text>
                      {food.brand && (
                        <Text className="text-slate-400 text-sm mt-1">{food.brand}</Text>
                      )}
                      <View className="flex-row mt-2">
                        <View className="bg-[#A3FF57] px-2 py-1 rounded-full mr-2">
                          <Text className="text-black text-xs font-medium">C: {food.carbohydrates}g</Text>
                        </View>
                        <View className="bg-[#4DABF7] px-2 py-1 rounded-full mr-2">
                          <Text className="text-white text-xs font-medium">P: {food.proteins}g</Text>
                        </View>
                        <View className="bg-[#FFB84D] px-2 py-1 rounded-full">
                          <Text className="text-black text-xs font-medium">G: {food.fat}g</Text>
                        </View>
                      </View>
                    </View>
                    <View className="bg-[#A3FF57] rounded-full p-2">
                      <Ionicons name="add" size={24} color="black" />
                    </View>
                  </Pressable>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={true}
                ListEmptyComponent={() => (
                  <View className="flex-1 justify-center items-center py-8">
                    <Ionicons name="search-outline" size={48} color="#64748B" />
                    <Text className="text-slate-400 text-base mt-4">Comienza a buscar ingredientes</Text>
                  </View>
                )}
              />
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
                <Pressable className="flex-row items-center" onPress={() => { setFormData(d => ({ ...d, ingredients: d.ingredients.filter(i => i.barcode !== selected.barcode) })); qtySheetRef.current?.close(); }}>
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

