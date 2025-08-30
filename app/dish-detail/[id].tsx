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
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import api from '../api/client';
import { getCurrentUserId } from '../services/_user';
import * as ImagePicker from 'expo-image-picker';
import QuantitySlider from '../utils/_QuantitySlider';
import { deleteDish } from '../services/dishService';

interface Food {
  barcode: any;
  name: string;
  brand?: string;
  carbohydrates: number;
  fat: number;
  proteins: number;
  calories: number;
}

interface Ingredient extends Food {
  quantity: number;
}

interface DishFormData {
  name: string;
  description: string;
  image: string | null;
  ingredients: Ingredient[];
}

interface DishDetailProps {
  readOnly?: boolean;
}

export default function DishDetailScreen({ readOnly = false }: DishDetailProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<DishFormData>({
    name: '',
    description: '',
    image: null,
    ingredients: []
  });
  const [errors, setErrors] = useState({ name: '' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchSheetRef = useRef<BottomSheetModal>(null);
  const qtySheetRef = useRef<BottomSheetModal>(null);
  const snapSearch = useMemo(() => ['50%'], []);
  const snapQty = useMemo(() => ['30%'], []);
  const [selected, setSelected] = useState<Ingredient | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const imageHeight = Math.min(screenWidth * 0.4, 250); // Reducido a 40% del ancho o máximo 250px

  const totalMacros = useMemo(
    () => formData.ingredients.reduce(
      (acc, ing) => {
        const r = ing.quantity / 100;
        return {
          carbs: acc.carbs + ing.carbohydrates * r,
          proteins: acc.proteins + ing.proteins * r,
          fat: acc.fat + ing.fat * r
        };
      },
      { carbs: 0, proteins: 0, fat: 0 }
    ),
    [formData.ingredients]
  );

  const valid = formData.name.trim() !== '' && formData.ingredients.length > 0;

  interface DishFoodItem {
    id: number;
    quantity: string;
    dish: {
      id: number;
      name: string;
      description: string;
      image: string;
      UserId: number;
    };
    foodItem: {
      barcode: string;
      name: string;
      brand: string;
      packageQuantity: number;
      allergens: string;
      ingredients: string;
      glutenFree: boolean;
      vegan: boolean;
      vegetarian: boolean;
      palmOil: boolean;
      imageFrontSmallUrl: string;
      imageFrontThumbUrl: string;
      imageFrontUrl: string;
      imageUrl: string;
      nutriscore: string;
      energyKcal: number;
      energyKj: number;
      carbohydrates: number;
      fat: number;
      proteins: number;
      saturatedFat: number;
      fiber: number;
      salt: number;
      alcohol: number | null;
      sodium: number;
      sugars: number;
      novaGroup: number | null;
      additives: string;
      lastCheck: string;
      isPersonal: boolean;
      creator: any;
    };
  }

  useEffect(() => {
    const fetchDishData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch basic dish information
        const dishResponse = await api.get(`/dishes/${id}`);
        const dish = dishResponse.data;
        
        // Fetch complete ingredient information using the new endpoint
        const ingredientsResponse = await api.get(`/dish/${id}/food-items`);
        const ingredients = ingredientsResponse.data;
        console.log('ingredients', ingredients);
        
        // Transform the API data to match our Ingredient interface
        const transformedIngredients = ingredients.map((item: DishFoodItem) => ({
          barcode: item.foodItem.barcode,
          name: item.foodItem.name,
          brand: item.foodItem.brand,
          carbohydrates: item.foodItem.carbohydrates,
          fat: item.foodItem.fat,
          proteins: item.foodItem.proteins,
          calories: item.foodItem.energyKcal,
          quantity: parseFloat(item.quantity) || 100
        }));
        
        setFormData({
          name: dish.name || '',
          description: dish.description || '',
          image: dish.image || null,
          ingredients: transformedIngredients
        });
      } catch (error) {
        console.error('Error cargando el plato:', error);
        setToastMessage('Error al cargar el plato');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchDishData();
  }, [id]);

  const fetchFoods = async (q: string) => {
    setSearchLoading(true);
    try {
      const { data } = await api.get<Food[]>('/fooditems', {
        params: { name: q }
      });
      setResults(data);
    } catch (error) {
      console.error('Error fetching foods:', error);
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim().length >= 2) {
      searchSheetRef.current?.present();
      fetchFoods(searchQuery.trim());
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim().length === 0) {
      setResults([]);
    }
  };

  const addIngredient = (food: Food) => {
    const newIngredient = {
      ...food,
      quantity: 100,
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
    if (!isEditing) return;
    setSelected(ing);
    qtySheetRef.current?.present();
  };

  const changeQty = (delta: number) => {
    if (!selected) return;
    setSelected({ ...selected, quantity: Math.max(5, selected.quantity + delta) });
  };

  const saveQty = () => {
    if (!selected) return;
    setFormData(d => ({
      ...d,
      ingredients: d.ingredients.map(i => i.barcode === selected.barcode ? selected : i)
    }));
    qtySheetRef.current?.close();
  };

  function dataUrlToFile(dataUrl: string, filename: string): File {
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/data:(.*?);base64/)?.[1] ?? 'image/jpeg';
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    return new File([blob], filename, { type: mime });
  }

  async function pickImage() {
    if (!isEditing) return;
    
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      alert('Se necesitan permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: Platform.OS === 'web',
      allowsMultipleSelection: false,
    });
    
    if (result.canceled || !result.assets?.[0]) return;

    const a = result.assets[0];
    const name = a.fileName || `image_${Date.now()}.jpg`;
    const type = (a as any).mimeType || 'image/jpeg';

    if (a.fileSize && a.fileSize > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande (máx. 5MB).');
      return;
    }

    const form = new FormData();

    if (Platform.OS === 'web') {
      const webFile: File =
        (a as any).file
          ? (a as any).file
          : a.uri.startsWith('data:')
            ? dataUrlToFile(a.uri, name)
            : new File([await (await fetch(a.uri)).blob()], name, { type });

      form.append('file', webFile);
    } else {
      form.append('file', { uri: a.uri, name, type } as any);
    }

    try {
      const resp = await api.post('/upload/image', form, { timeout: 30000 });
      setFormData(d => ({ ...d, image: resp.data.url }));
    } catch (err: any) {
      console.error('Error subiendo imagen:', err?.response?.data || err?.message || err);
      alert(`Error al subir la imagen: ${err?.response?.data?.message || err?.message || 'desconocido'}`);
    }
  }

  const saveDish = async () => {
    if (!valid) {
      if (!formData.name.trim()) setErrors({ name: 'Requerido' });
      return;
    }

    try {
      const currentUser = await getCurrentUserId();
      if (!currentUser) {
        console.error('No se pudo obtener el usuario actual');
        alert('Error obteniendo información del usuario.');
        return;
      }

      const dishData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image || "",
        UserId: currentUser
      };

      console.log('Actualizando datos del plato:', dishData);
      const dishResponse = await api.put(`/dishes/${id}`, dishData);

      // Actualizar ingredientes por separado
      const ingredientsData = {
        ingredients: formData.ingredients.map(ingredient => ({
          barcode: ingredient.barcode,
          quantity: ingredient.quantity.toString() // El API espera quantity como string
        }))
      };

      console.log('Actualizando ingredientes del plato:', ingredientsData);
      const ingredientsResponse = await api.put(`/dishes/${id}/ingredients`, ingredientsData);

      if ((dishResponse.status === 200 || dishResponse.status === 201) && 
          (ingredientsResponse.status === 200 || ingredientsResponse.status === 201)) {
        console.log('Plato e ingredientes actualizados exitosamente');
        setToastMessage('¡Plato actualizado!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          router.push('/plates');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error actualizando el plato:', error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Error desconocido al actualizar el plato';
      alert(`Error al actualizar el plato: ${errorMessage}`);
    }
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


const handleDeleteDish = () => {
  setShowConfirmModal(true);
};

const confirmDelete = async () => {
  setShowConfirmModal(false);
  if (!id) return;
  
  try {
    const success = await deleteDish(id as string);
    if (success) {
      setToastMessage('Plato eliminado correctamente');
      setShowToast(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      setToastMessage('Error al eliminar el plato');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  } catch (error) {
    setToastMessage('Error al eliminar el plato');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }
};

const cancelDelete = () => {
  setShowConfirmModal(false);
};

  // Optimized ingredient item component
  const IngredientItem = React.memo(({ ingredient, index }: { ingredient: Ingredient; index: number }) => {
    const displayQuantity = ingredient.quantity;
    const ratio = displayQuantity / 100;
    const carbs = (ingredient.carbohydrates * ratio).toFixed(1);
    const protein = (ingredient.proteins * ratio).toFixed(1);
    const fat = (ingredient.fat * ratio).toFixed(1);
    const calories = (ingredient.calories * ratio).toFixed(0);

    const handleQuantityChange = useCallback((newQuantity: number) => {
      updateIngredientQuantity(ingredient.barcode, newQuantity);
    }, [ingredient.barcode]);

    const handleRemove = useCallback(() => {
      removeIngredient(ingredient.barcode);
    }, [ingredient.barcode]);

    return (
      <View className="bg-slate-700 rounded-xl p-4 mb-3 shadow-lg">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1">
            <Text className="text-white font-semibold text-lg">{ingredient.name}</Text>
            {ingredient.brand && (
              <Text className="text-slate-400 text-sm mt-1">{ingredient.brand}</Text>
            )}
          </View>
        </View>

        <QuantitySlider
          value={ingredient.quantity}
          onValueChange={handleQuantityChange}
          onRemove={isEditing ? handleRemove : undefined}
          showRemoveButton={isEditing}
          disabled={!isEditing}
          minimumValue={5}
          maximumValue={500}
          step={5}
        />

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
              <Text className="text-black text-xs font-bold">G</Text>
            </View>
            <Text className="text-white font-semibold text-sm">{fat}g</Text>
          </View>
          <View className="items-center flex-1">
            <View className="bg-[#FF6B6B] rounded-full px-2 py-1 mb-1">
              <Text className="text-white text-xs font-bold">Cal</Text>
            </View>
            <Text className="text-white font-semibold text-sm">{calories}</Text>
          </View>
        </View>
      </View>
    );
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#A3FF57" />
        <Text className="text-white text-lg mt-4">Cargando plato...</Text>
      </SafeAreaView>
    );
  }

  return (
    <BottomSheetModalProvider>
      <SafeAreaView className={`flex-1 bg-slate-900 pt-${insets.top}`}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-lg font-semibold text-white">
            {isEditing ? 'Editar Plato' : 'Detalle del Plato'}
          </Text>
          <View className="flex-row items-center space-x-3">
            {!readOnly && (
              <Pressable onPress={handleDeleteDish}>
                <Ionicons name="trash-outline" size={24} color="#ef4444" />
              </Pressable>
            )}
            <Pressable onPress={() => setIsEditing(!isEditing)}>
              <Ionicons 
                name={isEditing ? 'eye-outline' : 'create-outline'} 
                size={24} 
                color="white" 
              />
            </Pressable>
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Plate Image */}
            <View className="relative">
              {formData.image ? (
                <Image 
                  source={{ uri: formData.image }} 
                  style={{ 
                    width: screenWidth, 
                    height: imageHeight,
                    maxHeight: 250 
                  }}
                  className="bg-slate-800"
                  resizeMode="cover"
                />
              ) : (
                <View 
                  style={{ 
                    width: screenWidth, 
                    height: imageHeight,
                    maxHeight: 250
                  }}
                  className="bg-slate-800 justify-center items-center"
                >
                  <Ionicons name="image-outline" size={64} color="#64748B" />
                  <Text className="text-slate-400 mt-2">Sin imagen</Text>
                </View>
              )}
              
              {/* Change Image Button */}
              {isEditing && (
                <Pressable 
                  onPress={pickImage}
                  className="absolute bottom-4 right-4 bg-[#A3FF57] rounded-full p-3 shadow-lg"
                  style={{ elevation: 5 }}
                >
                  <Ionicons name="camera" size={24} color="black" />
                </Pressable>
              )}
            </View>

            <View className="px-4 pb-20">
              {/* Nombre */}
              <View className="bg-slate-800 p-4 rounded-2xl mb-4 mt-4">
                <Text className="text-slate-300 mb-2">Nombre</Text>
                <TextInput
                  value={formData.name}
                  onChangeText={text => {
                    if (!isEditing) return;
                    setFormData(d => ({ ...d, name: text }));
                    if (text.trim()) setErrors({ name: '' });
                  }}
                  onBlur={() => {
                    if (isEditing && !formData.name.trim()) setErrors({ name: 'Requerido' });
                  }}
                  editable={isEditing}
                  className={`bg-slate-900 rounded-lg p-3 text-white text-lg ${
                    !isEditing ? 'opacity-70' : ''
                  }`}
                  style={{
                    fontSize: 18,
                    color: '#ffffff',
                  }}
                  placeholderTextColor="#9ca3af"
                  placeholder="Nombre del plato..."
                />
                {errors.name && <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>}
              </View>

              {/* Description */}
              <View className="bg-slate-800 p-4 rounded-2xl mb-4">
                <Text className="text-slate-300 mb-2">Descripción</Text>
                <TextInput
                  value={formData.description}
                  onChangeText={text => {
                    if (!isEditing) return;
                    setFormData(d => ({ ...d, description: text }));
                  }}
                  editable={isEditing}
                  multiline
                  numberOfLines={4}
                  className={`bg-slate-900 rounded-lg p-3 text-white text-lg ${
                    !isEditing ? 'opacity-70' : ''
                  }`}
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

              {/* Search for ingredients - Only in editing mode */}
              {isEditing && (
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
              )}

              {/* Ingredients */}
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Save Button - Only in editing mode */}
        {isEditing && (
          <View className="absolute bottom-0 left-0 right-0 bg-slate-900 bg-opacity-90 p-4">
            <Pressable
              className={`w-full py-4 rounded-2xl items-center ${
                valid ? 'bg-[#A3FF57]' : 'bg-slate-700'
              }`}
              onPress={saveDish}
              disabled={!valid}
            >
              <Text className="text-white font-semibold text-lg">Guardar Cambios</Text>
            </Pressable>
          </View>
        )}

        {/* Toast */}
        {showToast && (
          <View className="absolute top-20 left-4 right-4 bg-green-500 rounded-lg p-3 items-center">
            <Text className="text-white font-medium">{toastMessage}</Text>
          </View>
        )}

        {/* BottomSheet - Search */}
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
              {searchLoading && (
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

            {searchLoading ? (
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

        {/* BottomSheet - Quantity */}
        <BottomSheetModal
          ref={qtySheetRef}
          index={0}
          snapPoints={snapQty}
          backgroundStyle={{ backgroundColor: '#1e293b' }}
          handleIndicatorStyle={{ backgroundColor: '#64748B', width: 40 }}
        >
          {selected && (
            <View className="p-4">
              <Text className="text-white text-lg mb-4">{selected.name}</Text>
              <View className="flex-row items-center justify-center mb-6">
                <Pressable className="bg-slate-700 rounded-full p-2" onPress={() => changeQty(-10)}>
                  <Ionicons name="remove" size={20} color="white" />
                </Pressable>
                <Text className="text-white text-2xl mx-4">{selected.quantity} g</Text>
                <Pressable className="bg-slate-700 rounded-full p-2" onPress={() => changeQty(10)}>
                  <Ionicons name="add" size={20} color="white" />
                </Pressable>
              </View>
              <View className="flex-row justify-between">
                <Pressable
                  className="flex-row items-center"
                  onPress={() => {
                    setFormData(d => ({
                      ...d,
                      ingredients: d.ingredients.filter(i => i.barcode !== selected.barcode)
                    }));
                    qtySheetRef.current?.close();
                  }}
                >
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

        {/* Confirmation Modal of deletion*/}
        <Modal
          visible={showConfirmModal}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelDelete}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-zinc-800 rounded-lg p-6 mx-4 max-w-sm w-full">
              <Text className="text-white text-lg font-bold mb-2">Eliminar plato</Text>
              <Text className="text-zinc-300 mb-6">
                ¿Estás seguro de que quieres eliminar "{formData.name}"?
              </Text>
              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity
                  onPress={cancelDelete}
                  className="px-4 py-2 rounded bg-zinc-600 mr-3"
                >
                  <Text className="text-white">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmDelete}
                  className="px-4 py-2 rounded bg-red-600"
                >
                  <Text className="text-white font-bold">Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
}