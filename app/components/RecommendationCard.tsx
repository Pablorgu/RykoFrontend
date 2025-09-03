import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { RecommendationDto } from '../(types)/nutrition';
import { NutrientBadges } from '../utils/common/_NutrientBadges';
import { getDishById } from '../services/dishService';
import { Dish, Nutrients } from '../(types)/domain';

interface RecommendationCardProps {
  recommendation: RecommendationDto;
  loading: boolean;
  onAccept: () => void;
  onReject: () => void;
  onTryAnother: () => void;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export function RecommendationCard({
  recommendation,
  loading,
  onAccept,
  onReject,
  onTryAnother,
  onClose
}: RecommendationCardProps) {
  const [dish, setDish] = useState<Dish | null>(null);
  const [dishLoading, setDishLoading] = useState(true);
  const [nutrients, setNutrients] = useState<Nutrients>({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  
  const isSmall = screenWidth < 400;
  const cardWidth = isSmall ? screenWidth - 40 : screenWidth - 60;
  
  // Obtain dish data
  useEffect(() => {
    const fetchDish = async () => {
      if (!recommendation.dishId) return;
      
      setDishLoading(true);
      try {
        const dishData = await getDishById(recommendation.dishId.toString());
        setDish(dishData);
        
        // Calculate nutrients
        const calculatedNutrients: Nutrients = {
          kcal: recommendation.macros.kcal,
          protein: recommendation.macros.protein,
          carbs: recommendation.macros.carbs,
          fat: recommendation.macros.fat
        };
        setNutrients(calculatedNutrients);
      } catch (error) {
        console.error('Error fetching dish:', error);
      } finally {
        setDishLoading(false);
      }
    };
    
    fetchDish();
  }, [recommendation.dishId, recommendation.macros]);
  
  if (dishLoading) {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View 
            className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl p-8"
            style={{ width: cardWidth, maxWidth: 400 }}
          >
            <Text className="text-zinc-100 text-center">Cargando recomendación...</Text>
          </View>
        </View>
      </Modal>
    );
  }
  
  if (!dish) {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View 
            className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl p-8"
            style={{ width: cardWidth, maxWidth: 400 }}
          >
            <Text className="text-zinc-100 text-center">Error cargando el plato</Text>
            <TouchableOpacity onPress={onClose} className="mt-4 bg-red-600 rounded-lg py-2 px-4">
              <Text className="text-white text-center font-bold">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
  
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <View className="flex-1 bg-black/50 justify-center items-center px-5">
        {/* Card */}
        <View 
          className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl"
          style={{ width: cardWidth, maxWidth: 400 }}
        >
          {/* Header */}
          <View className="p-4 border-b border-zinc-700">
            <View className="flex-row justify-between items-center">
              <Text className="text-zinc-100 text-lg font-bold">✨ Recomendación</Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-zinc-400 text-xl">×</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Content */}
          <ScrollView className="max-h-96">
            <View className="p-4">
              {/* Dish Name */}
              <Text className="text-zinc-100 text-xl font-bold mb-2">
                {dish.name}
              </Text>
              
              {/* Scale Factor */}
              <Text className="text-zinc-300 text-sm mb-4">
                Factor de escala: {recommendation.scale}x
              </Text>
              
              {/* Score Badge */}
              {recommendation.score && (
                <View className="bg-purple-600 rounded-full px-3 py-1 self-start mb-4">
                  <Text className="text-white text-sm font-medium">
                    Puntuación: {Math.round(recommendation.score)}
                  </Text>
                </View>
              )}
              
              {/* Nutrients */}
              {recommendation.macros && (
                <View className="mb-4">
                  <Text className="text-zinc-300 text-sm font-medium mb-2">Macronutrientes:</Text>
                  <View className="bg-zinc-800 rounded-lg p-3">
                    <NutrientBadges 
                      nutrients={nutrients}
                      showPercentages={false}
                      size="sm"
                    />
                  </View>
                </View>
              )}
              
              {/* Ingredients */}
              {dish.ingredients && dish.ingredients.length > 0 && (
                <View className="mb-4">
                  <Text className="text-zinc-300 text-sm font-medium mb-2">Ingredientes:</Text>
                  <View className="bg-zinc-800 rounded-lg p-3">
                    {dish.ingredients.slice(0, 5).map((ingredient, index) => {
                      // Calcular la cantidad con el factor de escala
                      const scaledGrams = Math.round(ingredient.baseQuantity * recommendation.scale);
                      // Verificar si hay override para este ingrediente
                      const override = recommendation.overrides.find(o => o.ingredientId === ingredient.id);
                      const finalGrams = override ? override.grams : scaledGrams;
                      
                      return (
                        <Text key={index} className="text-zinc-400 text-xs mb-1">
                          • {ingredient.name} ({finalGrams}g)
                        </Text>
                      );
                    })}
                    {dish.ingredients.length > 5 && (
                      <Text className="text-zinc-500 text-xs mt-1">
                        +{dish.ingredients.length - 5} más...
                      </Text>
                    )}
                  </View>
                </View>
              )}
              
              {/* Overrides info */}
              {recommendation.overrides && recommendation.overrides.length > 0 && (
                <View className="bg-blue-900/30 border border-blue-600 rounded-lg p-3 mb-4">
                  <Text className="text-blue-400 text-sm">
                    ℹ️ Esta recomendación incluye {recommendation.overrides.length} ajuste(s) de ingredientes
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
          
          {/* Actions */}
          <View className="p-4 border-t border-zinc-700">
            <View className="flex-row gap-2">
              {/* Accept Button */}
              <TouchableOpacity
                onPress={onAccept}
                disabled={loading}
                className={`flex-1 bg-green-600 rounded-lg py-3 items-center ${
                  loading ? 'opacity-50' : ''
                }`}
              >
                <Text className="text-white font-bold">
                  {loading ? '⏳' : '✅'} Aceptar
                </Text>
              </TouchableOpacity>
              
              {/* Try Another Button */}
              <TouchableOpacity
                onPress={onTryAnother}
                disabled={loading}
                className={`flex-1 bg-purple-600 rounded-lg py-3 items-center ${
                  loading ? 'opacity-50' : ''
                }`}
              >
                <Text className="text-white font-bold">
                  {loading ? '⏳' : '🔄'} Otra
                </Text>
              </TouchableOpacity>
              
              {/* Reject Button */}
              <TouchableOpacity
                onPress={onReject}
                disabled={loading}
                className={`flex-1 bg-red-600 rounded-lg py-3 items-center ${
                  loading ? 'opacity-50' : ''
                }`}
              >
                <Text className="text-white font-bold">
                  {loading ? '⏳' : '❌'} Rechazar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}