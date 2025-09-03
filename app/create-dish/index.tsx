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
interface Food {
  barcode: any;
  name: string;
  brand?: string;
  carbohydrates: number,
  fat: number,
  proteins: number,
  calories: number, 
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

  // Function to handle manual search only
  const handleSearch = () => {
    if (searchQuery.trim().length >= 2) {
      // First open the bottom sheet
      searchSheetRef.current?.present();
      // Then start the search
      fetchFoods(searchQuery.trim());
    }
  };

  // Keep the original function without automatic search
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    // Only clear results if everything is deleted, but don't do automatic search
    if (text.trim().length === 0) {
      setResults([]);
    }
  };

  const addIngredient = (food: Food) => { 
    // Create a unique ingredient using barcode as identifier
    const newIngredient = {
      ...food,
      quantity: 100,
      // If the same barcode already exists, generate a unique instance
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
  // 1) Permissions
  const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!granted) { alert('Se necesitan permisos para acceder a la galería'); return; }

  // 2) Open gallery IMAGES ONLY
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],          // use strings; enums deprecated
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.8,
    base64: Platform.OS === 'web',   // useful if data URL comes in web
    allowsMultipleSelection: false,
  });
  if (result.canceled || !result.assets?.[0]) return;

  const a = result.assets[0];
  const name = a.fileName || `image_${Date.now()}.jpg`;
  const type = (a as any).mimeType || 'image/jpeg';

  // 3) Size limit (5MB)
  if (a.fileSize && a.fileSize > 5 * 1024 * 1024) {
    alert('La imagen es demasiado grande (máx. 5MB).');
    return;
  }

  // 4) Build FormData (MUST be called 'file' for FileInterceptor('file'))
  const form = new FormData();

  if (Platform.OS === 'web') {
    // Web: prefer asset.file if exists; if not, convert data URL to File
    const webFile: File =
      (a as any).file
        ? (a as any).file
        : a.uri.startsWith('data:')
          ? dataUrlToFile(a.uri, name)
          : new File([await (await fetch(a.uri)).blob()], name, { type });

    form.append('file', webFile);
  } else {
    // Native: RN converts {uri,name,type} to binary when sending
    form.append('file', { uri: a.uri, name, type } as any);
  }

  // 5) Send (don't force Content-Type, better let it set the boundary)
  try {
    const resp = await api.post('/upload/image', form, { timeout: 30000 });
    // 6) Save the URL returned by the backend in the dish state
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
  
      // Preparar los datos del plato en el formato requerido
      const dishData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image || "",
        UserId: currentUser,
        ingredients: formData.ingredients.map(ingredient => ({
          barcode: parseInt(ingredient.barcode) || ingredient.barcode,
          quantity: ingredient.quantity,
          name: ingredient.name,
          brand: ingredient.brand,
          carbohydrates: ingredient.carbohydrates,
          fat: ingredient.fat,
          proteins: ingredient.proteins,
          calories: ingredient.calories
        }))
      };
  
 
      const response = await api.post('/dishes/create', dishData);
      
      if (response.status === 201 || response.status === 200) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          router.push('/plates');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error guardando el plato:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error desconocido al guardar el plato';
      
      alert(`Error al guardar el plato: ${errorMessage}`);
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
    <View className="bg-app-surface-secondary rounded-xl p-4 mb-3 shadow-lg">
      {/* Header with name */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1">
          <Text className="text-app-text-primary font-semibold text-lg">{ingredient.name}</Text>
          {ingredient.brand && (
            <Text className="text-app-text-tertiary text-sm mt-1">{ingredient.brand}</Text>
          )}
        </View>
      </View>
      
      {/* Slider of quantity with modern design */}
      <QuantitySlider
        value={ingredient.quantity}
        onValueChange={handleQuantityChange}
        onRemove={handleRemove}
        showRemoveButton={true}
        minimumValue={5}
        maximumValue={500}
        step={5}
        label="Cantidad"
      />
      
      {/* Badges with macros */}
      <View className="flex-row justify-between bg-app-surface-tertiary rounded-lg p-3">
        <View className="items-center flex-1">
          <View className="bg-app-macro-carbs rounded-full px-2 py-1 mb-1">
            <Text className="text-black text-xs font-bold">C</Text>
          </View>
          <Text className="text-app-text-primary font-semibold text-sm">{carbs}g</Text>
        </View>
        <View className="items-center flex-1">
          <View className="bg-app-macro-protein rounded-full px-2 py-1 mb-1">
            <Text className="text-white text-xs font-bold">P</Text>
          </View>
          <Text className="text-app-text-primary font-semibold text-sm">{protein}g</Text>
        </View>
        <View className="items-center flex-1">
          <View className="bg-app-macro-fat rounded-full px-2 py-1 mb-1">
            <Text className="text-black text-xs font-bold">G</Text>
          </View>
          <Text className="text-app-text-primary font-semibold text-sm">{fat}g</Text>
        </View>
        <View className="items-center flex-1">
          <View className="bg-app-macro-calories rounded-full px-2 py-1 mb-1">
            <Text className="text-white text-xs font-bold">Cal</Text>
          </View>
          <Text className="text-app-text-primary font-semibold text-sm">{calories}</Text>
        </View>
      </View>
    </View>
  );
});

  

  return (
    <BottomSheetModalProvider>
      <SafeAreaView className={`flex-1 bg-app-bg-primary pt-${insets.top}`}>        
        <View className="flex-row items-center justify-between px-4 py-4">
          <Pressable onPress={() => router.push('/plates')}><Ionicons name="arrow-back" size={24} color="white" /></Pressable>
          <Text className="text-lg font-semibold text-app-text-primary">Crear Plato</Text>
          <View className="w-6" />
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView className="px-4 pb-20" showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View className="bg-app-surface-tertiary p-4 rounded-2xl mb-4">
              <Text className="text-app-text-secondary mb-2">Nombre</Text>
              <TextInput
                value={formData.name}
                onChangeText={text => {
                  setFormData(d => ({ ...d, name: text }));
                  if (text.trim()) setErrors({ name: '' });
                }}
                onBlur={() => {
                  if (!formData.name.trim()) setErrors({ name: 'Requerido' });
                }}
                className="bg-app-surface-secondary rounded-lg p-3 text-app-text-primary text-base"
                style={{
                  fontSize: 16,
                  color: '#ffffff',
                }}
                placeholderTextColor="#9ca3af"
                placeholder="Nombre del plato..."
              />
              {errors.name && <Text className="text-app-accent-error text-sm mt-1">{errors.name}</Text>}
            </View>
            {/* Description */}
            <View className="bg-app-surface-tertiary p-4 rounded-2xl mb-4">
              <Text className="text-app-text-secondary mb-2">Descripción</Text>
              <TextInput
                value={formData.description}
                onChangeText={text => setFormData(d => ({ ...d, description: text }))}
                multiline
                numberOfLines={4}
                className="bg-app-surface-secondary rounded-lg p-3 text-app-text-primary text-lg"
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
            {/* Image */}
            <View className="bg-app-surface-tertiary p-4 rounded-2xl mb-4">
              <Text className="text-app-text-secondary mb-2">Imagen</Text>
              <Pressable className="h-40 border-2 border-dashed border-app-text-muted rounded-2xl items-center justify-center" onPress={pickImage}>
                {formData.image ? <Image source={{ uri: formData.image }} className="w-full h-full rounded-2xl" /> : <Ionicons name="add" size={32} color="#A3FF57" />}
              </Pressable>
            </View>
            {/* Search */}
            <View className="bg-app-surface-tertiary p-4 rounded-2xl mb-4">
              <Text className="text-app-text-secondary mb-2">Buscar alimento</Text>
              <View className="flex-row items-center">
                <View className="flex-1 mr-2">
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="bg-app-surface-secondary rounded-lg p-3 text-app-text-primary text-base"
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
                  className="bg-app-accent-primary rounded-lg p-3"
                  onPress={handleSearch}
                  disabled={searchQuery.trim().length < 2}
                >
                  <Ionicons name="search" size={20} color="black" />
                </Pressable>
              </View>
            </View>
            {/* Ingredients */}
            {formData.ingredients.length > 0 && (
              <View className="bg-app-surface-tertiary p-4 rounded-2xl mb-4">
                <Text className="text-app-text-secondary mb-4 text-lg font-semibold">Ingredientes</Text>
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
        {/* Save button */}
        <View className="absolute bottom-0 left-0 right-0 bg-app-bg-primary bg-opacity-90 p-4">
          <Pressable className={`w-full py-4 rounded-2xl items-center ${valid ? 'bg-app-accent-primary' : 'bg-app-surface-secondary/50'}`} onPress={saveDish} disabled={!valid}>
            <Text className={`${valid ? 'text-app-surface-tertiary' : 'text-app-text-primary'  } font-semibold text-lg`}>Guardar Plato</Text>
          </Pressable>
        </View>
        {/* Toast */}
        {showToast && (
          <View className="absolute top-20 left-4 right-4 bg-app-accent-success rounded-lg p-3 items-center">
            <Text className="text-app-text-primary font-medium">¡Plato creado!</Text>
          </View>
        )}
        {/* BottomSheet - Search */}
        <BottomSheetModal 
          ref={searchSheetRef} 
          index={0} 
          snapPoints={snapSearch} 
          backgroundStyle={{ backgroundColor: '#18181B' }} 
          handleIndicatorStyle={{ backgroundColor: '#64748B', width: 40 }}
        >
          <View className="p-4 flex-1">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-app-text-primary text-lg font-semibold">Buscar alimentos</Text>
              {loading && (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#A3FF57" size="small" />
                  <Text className="text-app-accent-primary text-sm ml-2">Buscando...</Text>
                </View>
              )}
            </View>
            
            <TextInput 
              value={searchQuery} 
              onChangeText={setSearchQuery} 
              placeholder="Escribe para buscar..." 
              placeholderTextColor="#64748B" 
              className="bg-app-surface-secondary rounded-lg px-3 py-3 text-app-text-primary mb-4 text-base" 
              style={{
                fontSize: 16,
                color: '#ffffff',
              }}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <View className="bg-app-surface-tertiary rounded-2xl p-8 items-center">
                  <ActivityIndicator color="#A3FF57" size="large" />
                  <Text className="text-app-text-primary text-base mt-4 font-medium">Buscando ingredientes...</Text>
                  <Text className="text-app-text-tertiary text-sm mt-2 text-center">
                    Estamos encontrando los mejores resultados para "{searchQuery}"
                  </Text>
                </View>
              </View>
            ) : results.length === 0 && searchQuery.length >= 2 ? (
              <View className="flex-1 justify-center items-center">
                <View className="bg-app-surface-tertiary rounded-2xl p-8 items-center">
                  <Ionicons name="search-outline" size={48} color="#64748B" />
                  <Text className="text-app-text-tertiary text-base mt-4 font-medium">No se encontraron alimentos</Text>
                  <Text className="text-app-text-muted text-sm mt-2 text-center">
                    Intenta con otro término de búsqueda
                  </Text>
                </View>
              </View>
            ) : searchQuery.length < 2 ? (
              <View className="flex-1 justify-center items-center">
                <View className="bg-app-surface-tertiary rounded-2xl p-8 items-center">
                  <Ionicons name="restaurant-outline" size={48} color="#64748B" />
                  <Text className="text-app-text-tertiary text-base mt-4 font-medium">Escribe al menos 2 caracteres</Text>
                  <Text className="text-app-text-muted text-sm mt-2 text-center">
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
                    className="flex-row justify-between items-center bg-app-surface-secondary rounded-xl p-4 mb-3 shadow-sm" 
                    onPress={() => addIngredient(food)}
                    style={{ elevation: 2 }}
                  >
                    <View className="flex-1">
                      <Text className="text-app-text-primary font-semibold text-base">{food.name}</Text>
                      {food.brand && (
                        <Text className="text-app-text-tertiary text-sm mt-1">{food.brand}</Text>
                      )}
                      <View className="flex-row mt-2">
                        <View className="bg-app-macro-carbs px-2 py-1 rounded-full mr-2">
                          <Text className="text-black text-xs font-medium">C: {food.carbohydrates}g</Text>
                        </View>
                        <View className="bg-app-macro-protein px-2 py-1 rounded-full mr-2">
                          <Text className="text-white text-xs font-medium">P: {food.proteins}g</Text>
                        </View>
                        <View className="bg-app-macro-fat px-2 py-1 rounded-full">
                          <Text className="text-black text-xs font-medium">G: {food.fat}g</Text>
                        </View>
                      </View>
                    </View>
                    <View className="bg-app-accent-primary rounded-full p-2">
                      <Ionicons name="add" size={24} color="black" />
                    </View>
                  </Pressable>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={true}
                ListEmptyComponent={() => (
                  <View className="flex-1 justify-center items-center py-8">
                    <Ionicons name="search-outline" size={48} color="#64748B" />
                    <Text className="text-app-text-tertiary text-base mt-4">Comienza a buscar ingredientes</Text>
                  </View>
                )}
              />
            )}
          </View>
        </BottomSheetModal>
        {/* BottomSheet - Quantity */}
        <BottomSheetModal ref={qtySheetRef} index={0} snapPoints={snapQty} backgroundStyle={{ backgroundColor: '#18181B' }} handleIndicatorStyle={{ backgroundColor: '#64748B', width: 40 }}>
          {selected && (
            <View className="p-4">
              <Text className="text-app-text-primary text-lg mb-4">{selected.name}</Text>
              <View className="flex-row items-center justify-center mb-6">
                <Pressable className="bg-app-surface-secondary rounded-full p-2" onPress={() => changeQty(-10)}><Ionicons name="remove" size={20} color="white" /></Pressable>
                <Text className="text-app-text-primary text-2xl mx-4">{selected.quantity} g</Text>
                <Pressable className="bg-app-surface-secondary rounded-full p-2" onPress={() => changeQty(10)}><Ionicons name="add" size={20} color="white" /></Pressable>
              </View>
              <View className="flex-row justify-between">
                <Pressable className="flex-row items-center" onPress={() => { setFormData(d => ({ ...d, ingredients: d.ingredients.filter(i => i.barcode !== selected.barcode) })); qtySheetRef.current?.close(); }}>
                  <Ionicons name="trash" size={20} color="#ef4444" />
                  <Text className="text-app-accent-error ml-2">Eliminar</Text>
                </Pressable>
                <Pressable className="bg-app-accent-primary px-6 py-2 rounded-2xl" onPress={saveQty}>
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

