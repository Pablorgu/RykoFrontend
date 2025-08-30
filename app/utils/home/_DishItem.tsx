import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { IngredientQuantity } from './_IngredientQuantity';
import { NutrientBadges } from '../common/_NutrientBadges';
import { MealDishIngredientOverrideDto, MealType, Dish } from '../../(types)/domain';
import { useDayStore } from '../../(store)/dayStore';
import { nutrientsForDish } from '../../(types)/nutrition';
import { getDishById } from '../../services/dishService';

interface DishItemProps {
  mealType: MealType;
  dishId: string;
  mealDishId: number;
  overrides: MealDishIngredientOverrideDto[];
  onRemove: () => void;
}

export function DishItem({ 
  mealType, 
  dishId, 
  mealDishId, 
  overrides, 
  onRemove 
}: DishItemProps) {
  const { setIngredientOverride, error, clearError } = useDayStore();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const fetchedDish = await getDishById(dishId);
        setDish(fetchedDish);
      } catch (error) {
        console.error('Error fetching dish:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDish();
  }, [dishId]);

  useEffect(() => {
    if (error) {
      setPendingUpdates(new Map()); 
    }
  }, [error]);

  // Debounce para las actualizaciones de ingredientes
  const debouncedUpdate = useCallback(
    debounce(async (ingredientId: string, grams: number) => {
      try {
        await setIngredientOverride(mealType, mealDishId, ingredientId, grams);
        setPendingUpdates(prev => {
          const newMap = new Map(prev);
          newMap.delete(ingredientId);
          return newMap;
        });
      } catch (error) {
        // En caso de error, también limpiar el pending update
        setPendingUpdates(prev => {
          const newMap = new Map(prev);
          newMap.delete(ingredientId);
          return newMap;
        });
      }
    }, 500),
    [mealType, mealDishId, setIngredientOverride]
  );

  const handleIngredientChange = useCallback((ingredientId: string, grams: number) => {
    setPendingUpdates(prev => new Map(prev).set(ingredientId, grams));
    
    debouncedUpdate(ingredientId, grams);
    
    if (error) {
      clearError();
    }
  }, [debouncedUpdate, error, clearError]);

  if (loading) {
    return (
      <View className="bg-zinc-900 rounded-lg p-4 mb-3">
        <Text className="text-zinc-400">Cargando plato...</Text>
      </View>
    );
  }

  if (!dish) {
    return (
      <View className="bg-zinc-900 rounded-lg p-4 mb-3">
        <Text className="text-red-400">Plato no encontrado: {dishId}</Text>
      </View>
    );
  }

  // Validar que el plato tenga ingredientes
  if (!dish.ingredients || !Array.isArray(dish.ingredients)) {
    return (
      <View className="bg-zinc-900 rounded-lg p-4 mb-3">
        <Text className="text-yellow-400">Plato sin ingredientes: {dish.name}</Text>
      </View>
    );
  }

  // Combinar overrides del store con updates pendientes
  const effectiveOverrides = [...overrides];
  pendingUpdates.forEach((grams, ingredientId) => {
    const existingIndex = effectiveOverrides.findIndex(o => o.ingredientId === ingredientId);
    if (existingIndex >= 0) {
      effectiveOverrides[existingIndex] = { ingredientId, grams };
    } else {
      effectiveOverrides.push({ ingredientId, grams });
    }
  });

  const dishNutrients = nutrientsForDish(dish, effectiveOverrides);
  const overrideMap = new Map(effectiveOverrides.map(o => [o.ingredientId, o.grams]));

  const handleRemove = () => {
    Alert.alert(
      'Quitar plato',
      `¿Estás seguro de que quieres quitar "${dish.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Quitar', style: 'destructive', onPress: onRemove },
      ]
    );
  };

  return (
    <View className="bg-zinc-900 rounded-lg p-2 border border-zinc-800">
      {/* Indicador de error si existe */}
      {error && (
        <View className="bg-red-900/20 border border-red-500/30 rounded p-2 mb-2">
          <Text className="text-red-400 text-xs">{error}</Text>
        </View>
      )}
      
      {/* Header del plato */}
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-zinc-100 font-bold text-sm flex-1">{dish.name}</Text>
        <TouchableOpacity
          onPress={handleRemove}
          className="bg-red-600 rounded-full w-6 h-6 items-center justify-center ml-2"
        >
          <Text className="text-white text-sm font-bold">×</Text>
        </TouchableOpacity>
      </View>

      {/* Nutrientes */}
      <View className="mb-1">
        <NutrientBadges nutrients={dishNutrients} />
      </View>

      {/* Ingredientes con indicadores de estado */}
      <View>
        {dish.ingredients.map(ingredient => {
          const currentGrams = overrideMap.get(ingredient.id) ?? ingredient.baseQuantity;
          const isPending = pendingUpdates.has(ingredient.id);
          
          return (
            <View key={ingredient.id} className="relative">
              <IngredientQuantity
                value={currentGrams}
                onChange={(grams) => handleIngredientChange(ingredient.id, grams)}
                ingredientName={ingredient.name}
                min={0}
                max={500}
                step={5}
              />
              {/* Indicador de actualización pendiente */}
              {isPending && (
                <View className="absolute right-2 top-2">
                  <View className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Función debounce helper
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}