import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, ScrollView, Dimensions } from 'react-native';
import { DishItem } from './_DishItem';
import { NutrientBadges } from '../common/_NutrientBadges';
import { useDayStore } from '../../(store)/dayStore';
import { nutrientsForMealAsync, nutrientsForDish } from '../../(types)/nutrition';
import { MEAL_DISPLAY_NAMES, MealType, Dish, Nutrients } from '../../(types)/domain';
import { searchDishes, getAllDishes } from '../../services/dishService';
import { getCurrentUserId } from '../../services/_user';
import { DishSearchItem } from './_DishSearchItem';
import { useRecommendation } from '../../hooks/useRecommendation';
import { RecommendationCard } from '../../components/RecommendationCard';

interface MealCardProps {
  mealType: MealType;
}

const { width: screenWidth } = Dimensions.get('window');

export function MealCard({ mealType }: MealCardProps) {
  const { day, addDishToMeal, removeDishFromMeal, loadDayData } = useDayStore();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Dish[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [mealNutrients, setMealNutrients] = useState<Nutrients>({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  
  // Recommendation hook only for dinner
  const recommendation = useRecommendation(
    day?.date || new Date().toISOString().split('T')[0],
    mealType === 'dinner' ? mealType : 'dinner'
  );
  
  // Obtener la comida específica del día
  const meal = day?.meals.find(m => m.type === mealType);

  React.useEffect(() => {
    const calculateNutrients = async () => {
      if (meal) {
        try {
          const nutrients = await nutrientsForMealAsync(meal);
          setMealNutrients(nutrients);
        } catch (error) {
          console.error('Error calculating meal nutrients:', error);
          setMealNutrients({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
        }
      } else {
        setMealNutrients({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
      }
    };
    calculateNutrients();
  }, [meal]);
  
  // Obtener userId al montar el componente
  useEffect(() => {
    const loadUserId = async () => {
      const id = await getCurrentUserId();
      setUserId(id);
    };
    loadUserId();
  }, []);
  
  // Función para cargar todos los platos del usuario
  const loadAllDishes = async () => {
    if (!userId) return;
    
    setSearchLoading(true);
    try {
      const allDishes = await getAllDishes(userId);
      setSearchResults(allDishes);
    } catch (error) {
      console.error('Error loading all dishes:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Función para buscar platos
  const handleSearch = async (query: string) => {
    if (query.trim().length < 2 || !userId) {
      // Si no hay query, cargar todos los platos
      if (query.trim().length === 0) {
        await loadAllDishes();
      } else {
        setSearchResults([]);
      }
      return;
    }
    
    setSearchLoading(true);
    try {
      const results = await searchDishes(query, userId);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching dishes:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  const handleAddDish = async (dishId: string) => {
    await addDishToMeal(mealType, dishId);
    setShowModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveDish = async (mealDishId: number) => {
    try {
      await removeDishFromMeal(mealType, mealDishId);
    } catch (error) {
    }
  };

  // Responsive text sizes
  const getTextSizes = () => {
    if (screenWidth < 400) {
      return {
        title: 'text-base',
        emoji: 'text-3xl',
        emptyTitle: 'text-sm',
        emptySubtitle: 'text-xs',
        button: 'text-sm'
      };
    } else if (screenWidth < 500) {
      return {
        title: 'text-lg',
        emoji: 'text-4xl',
        emptyTitle: 'text-base',
        emptySubtitle: 'text-sm',
        button: 'text-base'
      };
    } else {
      return {
        title: 'text-xl',
        emoji: 'text-5xl',
        emptyTitle: 'text-lg',
        emptySubtitle: 'text-base',
        button: 'text-lg'
      };
    }
  };

  const textSizes = getTextSizes();
  const responsivePadding = screenWidth < 400 ? 'p-3' : 'p-4';
  const responsiveMargin = screenWidth < 400 ? 'mb-2' : 'mb-4';

  return (
    <View className={`bg-zinc-900 rounded-xl border border-zinc-800 w-full ${responsivePadding}`}>
      {/* Responsive Header */}
      <View className={`${responsiveMargin} items-center`}>
        <Text className={`text-zinc-100 font-bold ${textSizes.title} ${screenWidth < 400 ? 'mb-2' : 'mb-3'}`}>
          {MEAL_DISPLAY_NAMES[mealType]}
        </Text>
        
        {meal && meal.items.length > 0 && mealNutrients.kcal > 0 && (
          <View className={`bg-zinc-800 rounded-lg w-full ${screenWidth < 400 ? 'p-2' : 'p-3'}`}>
            <NutrientBadges 
              nutrients={mealNutrients} 
              showPercentages={true}
              size="sm"
            />
          </View>
        )}
      </View>

      {/* Plates list*/}
      <View>
        {meal?.items && meal.items.length > 0 ? (
          <View>
            {meal.items.map((mealDish, index) => (
              <View key={`${mealDish.dishId}-${index}`} className={`${screenWidth < 400 ? 'mb-2' : 'mb-3'}`}>
                <DishItem
                  mealType={mealType}
                  dishId={mealDish.dishId}
                  mealDishId={mealDish.mealDishId} 
                  overrides={mealDish.overrides}
                  onRemove={() => handleRemoveDish(mealDish.mealDishId)}  
                />
              </View>
            ))}
          </View>
        ) : (
          <View className={`bg-zinc-800 rounded-lg items-center justify-center ${screenWidth < 400 ? 'px-4 py-8' : 'px-6 py-12'}`}>
            <View className="items-center">
              <Text className={`${textSizes.emoji} ${screenWidth < 400 ? 'mb-2' : 'mb-3'}`}>🍽️</Text>
              <Text className={`text-zinc-300 text-center ${textSizes.emptyTitle} font-medium`}>
                No hay platos añadidos
              </Text>
              <Text className={`text-zinc-500 text-center ${textSizes.emptySubtitle} ${screenWidth < 400 ? 'mt-1' : 'mt-2'}`}>
                Toca el botón de abajo para añadir tu primer plato
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Responsive Add Button */}
      <View className={screenWidth < 400 ? 'mt-3' : 'mt-4'}>
        <TouchableOpacity
          onPress={() => {
            setShowModal(true);
            // Load all dishes when the modal is opened
            if (userId && searchResults.length === 0 && searchQuery.trim() === '') {
              loadAllDishes();
            }
          }}
          className={`bg-app-accent-primary rounded-lg items-center w-full ${
            screenWidth < 400 ? 'py-2 px-3' : 'py-3 px-4'
          }`}
          accessibilityLabel={`Añadir plato a ${MEAL_DISPLAY_NAMES[mealType]}`}
        >
          <Text className={`text-black font-bold ${textSizes.button}`}>+ Añadir plato</Text>
        </TouchableOpacity>
        
        {/* Recommendation button only for dinner */}
        {mealType === 'dinner' && (
          <TouchableOpacity
            onPress={() => recommendation.load()}
            disabled={recommendation.loading}
            className={`bg-purple-600 rounded-lg items-center w-full ${
              screenWidth < 400 ? 'py-2 px-3 mt-2' : 'py-3 px-4 mt-3'
            } ${recommendation.loading ? 'opacity-50' : ''}`}
            accessibilityLabel="Recomendar plato para cena"
          >
            <Text className={`text-white font-bold ${textSizes.button}`}>
              {recommendation.loading ? '🔄 Cargando...' : '✨ Recomendar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal de búsqueda */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-zinc-900">
          <View className="flex-row justify-between items-center p-4 border-b border-zinc-700">
            <Text className="text-zinc-100 text-lg font-bold">
              Añadir plato a {MEAL_DISPLAY_NAMES[mealType]}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text className="text-lime-500 text-base font-medium">Cerrar</Text>
            </TouchableOpacity>
          </View>
          
          <View className="p-4">
            <TextInput
              className="bg-zinc-800 text-zinc-100 p-3 rounded-lg mb-4"
              placeholder="Buscar platos..."
              placeholderTextColor="#71717a"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DishSearchItem 
                dish={item} 
                onPress={handleAddDish}
              />
            )}
            className="flex-1"
          />
        </View>
      </Modal>
      
      {/* Recommendation card only for dinner */}
      {mealType === 'dinner' && recommendation.current && (
        <RecommendationCard
          recommendation={recommendation.current}
          loading={recommendation.loading}
          onAccept={async () => {
            await recommendation.accept();
          }}
          onReject={() => {
            recommendation.reject();
          }}
          onTryAnother={() => {
            recommendation.another();
          }}
          onClose={() => {
            recommendation.reset();
          }}
        />
      )}
    </View>
  );
}