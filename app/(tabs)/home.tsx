import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDayStore } from '../(store)/dayStore';
import { nutrientsForDayAsync } from '../(types)/nutrition';
import { Dish, MEAL_ORDER } from '../(types)/domain';
import { MealCarousel } from '../utils/home/_MealCarousel';
import { DayTotals } from '../utils/home/_DayTotals';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { day, loading, loadDayData } = useDayStore();

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  useEffect(() => {
    loadDayData(selectedDate);
  }, [loadDayData, selectedDate]);
  
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

  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Hoy';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Ayer';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  
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
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header con navegación de fechas */}
        <View className="px-5 py-6 border-b border-zinc-800">
          <Text className="text-3xl font-bold text-zinc-100 mb-4">
            Hola! 👋
          </Text>
          
          {/* Navegador de fechas */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity 
              onPress={goToPreviousDay}
              className="p-2 rounded-full bg-zinc-800"
            >
              <Ionicons name="chevron-back" size={24} color="#f4f4f5" />
            </TouchableOpacity>
            
            <View className="flex-1 mx-4">
              <Text className="text-zinc-100 text-lg font-semibold text-center">
                {formatDate(selectedDate)}
              </Text>
              <Text className="text-zinc-400 text-sm text-center">
                {new Date(selectedDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={goToNextDay}
              className="p-2 rounded-full bg-zinc-800"
            >
              <Ionicons name="chevron-forward" size={24} color="#f4f4f5" />
            </TouchableOpacity>
          </View>
          
          {/* Botón para ir a hoy */}
          {!isToday && (
            <TouchableOpacity 
              onPress={goToToday}
              className="mt-3 py-2 px-4 bg-gray-100 border border-gray-300 rounded-full self-center flex-row items-center"
            >
              <Ionicons name="today-outline" size={16} color="#374151" />
              <Text className="text-gray-700 font-medium text-sm ml-2">Ir a Hoy</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Meal carousel*/}
        <View className="pt-6">
          <Text className="text-xl font-bold text-zinc-100 px-5 mb-6">
            🍽️ Tus comidas de {isToday ? 'hoy' : formatDate(selectedDate).toLowerCase()}
          </Text>
          <MealCarousel meals={MEAL_ORDER} />
        </View>
        
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
      </ScrollView>
    </SafeAreaView>
  );
}
