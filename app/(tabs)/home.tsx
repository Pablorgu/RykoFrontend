import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDayStore } from '../(store)/dayStore';
import { nutrientsForDayAsync } from '../(types)/nutrition';
import { Dish, MEAL_ORDER } from '../(types)/domain';
import { MealCarousel } from '../utils/home/_MealCarousel';
import { DayTotals } from '../utils/home/_DayTotals';
import { getDishById } from '../services/dishService';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { day, loading, loadDayData } = useDayStore();
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    loadDayData(today);
  }, [loadDayData]);
  
  // Function to get dish by ID
  const getDishByIdAsync = async (id: string): Promise<Dish | undefined> => {
    const dish = await getDishById(id);
    return dish || undefined;
  };
  
  // Calculate day totals
  const [dayNutrients, setDayNutrients] = React.useState({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  
  // Create dependency that detects changes in overrides
  const dayDependency = React.useMemo(() => {
    if (!day) return null;
    return JSON.stringify({
      meals: day.meals.map(meal => ({
        type: meal.type,
        items: meal.items.map(item => ({
          dishId: item.dishId,
          mealDishId: item.mealDishId,
          overrides: item.overrides
        }))
      }))
    });
  }, [day]);
  
  React.useEffect(() => {
    const calculateNutrients = async () => {
      if (day) {
        try {
          const nutrients = await nutrientsForDayAsync(day);
          setDayNutrients(nutrients);
        } catch (error) {
          console.error('Error calculating day nutrients:', error);
          setDayNutrients({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
        }
      } else {
        setDayNutrients({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
      }
    };
    calculateNutrients();
  }, [dayDependency]);
  
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">Cargando...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View className="px-5 py-6 border-b border-zinc-800">
          <Text className="text-3xl font-bold text-zinc-100 mb-2">
            Hola! 👋
          </Text>
          <Text className="text-zinc-400 text-lg">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </Text>
        </View>
        
        {/* Meal carousel*/}
        <View className="pt-6">
          <Text className="text-xl font-bold text-zinc-100 px-5 mb-6">
            🍽️ Tus comidas de hoy
          </Text>
          <MealCarousel meals={MEAL_ORDER} />
        </View>
        
        {/* Additional content with conditional spacing */}
        <View className="flex-1 justify-end">
          {/* Day totals with progress bars */}
          <DayTotals nutrients={dayNutrients} />
          
          {/* More compact daily tip */}
          <View className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-5 mx-5 mb-6">
            <Text className="text-zinc-100 font-bold text-lg mb-2">
              💡 Tip del día
            </Text>
            <Text className="text-zinc-300 leading-5">
              Mantén un equilibrio entre todos los macronutrientes y no olvides hidratarte bien.
            </Text>
          </View>
          
          {/* Additional space for scrolling */}
          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
