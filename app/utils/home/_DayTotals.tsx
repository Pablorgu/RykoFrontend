import React from 'react';
import { View, Text } from 'react-native';
import { Nutrients } from '../../(types)/domain';
import { useAuthStore } from '../../(store)/authStore';

interface DayTotalsProps {
  nutrients: Nutrients;
}

// Function to calculate macronutrient grams based on calories and percentages
const calculateMacroGrams = (calories: number, percentage: number, caloriesPerGram: number): number => {
  return Math.round((calories * percentage / 100) / caloriesPerGram);
};

// Constants for calories per gram
const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9
};

interface ProgressBarProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  icon: string;
}

// Function to render progress bars
function ProgressBar({ label, current, goal, unit, color, icon }: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isOverGoal = current > goal;

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">{icon}</Text>
          <Text className="text-zinc-100 font-medium">{label}</Text>
        </View>
        <Text className={`font-bold ${isOverGoal ? 'text-red-400' : 'text-zinc-100'}`}>
          {Math.round(current)}/{goal} {unit}
        </Text>
      </View>
      
      <View className="bg-zinc-800 rounded-full h-3 overflow-hidden">
        <View
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </View>
      
      {isOverGoal && (
        <Text className="text-red-400 text-xs mt-1">
          +{Math.round(current - goal)} {unit} sobre el objetivo
        </Text>
      )}
    </View>
  );
}

export function DayTotals({ nutrients }: DayTotalsProps) {
  const { user } = useAuthStore();
  
  // Calculate daily goals based on user profile
  const dailyGoals = React.useMemo(() => {
    if (!user || !user.calorieGoal) {
      // Default values if no user profile
      return {
        kcal: 2000,
        protein: 150,
        carbs: 250,
        fat: 67
      };
    }
    
    const calories = user.calorieGoal;
    const proteinPct = user.proteinPct || 30;
    const carbsPct = user.carbsPct || 40;
    const fatPct = user.fatPct || 30;
    
    return {
      kcal: calories,
      protein: calculateMacroGrams(calories, proteinPct, CALORIES_PER_GRAM.protein),
      carbs: calculateMacroGrams(calories, carbsPct, CALORIES_PER_GRAM.carbs),
      fat: calculateMacroGrams(calories, fatPct, CALORIES_PER_GRAM.fat)
    };
  }, [user]);
  
  const caloriesPercentage = (nutrients.kcal / dailyGoals.kcal) * 100;
  
  return (
    <View className="bg-zinc-900 rounded-xl p-6 mx-5 mb-6">
      <Text className="text-xl font-bold text-zinc-100 mb-6 text-center">
        📊 Resumen del día
      </Text>
      
      {/* Main calories */}
      <View className="bg-zinc-800 rounded-lg p-4 mb-6">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-zinc-100 font-bold text-lg">Calorías totales</Text>
          <Text className="text-2xl font-bold text-app-macro-calories">
            {Math.round(nutrients.kcal)}
          </Text>
        </View>
        <View className="bg-zinc-700 rounded-full h-4 overflow-hidden">
          <View
            className="h-full bg-app-macro-calories rounded-full"
            style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
          />
        </View>
        <Text className="text-zinc-400 text-sm mt-1 text-center">
          {Math.round(caloriesPercentage)}% del objetivo diario
        </Text>
      </View>

      {/* Macronutrientes */}
      <Text className="text-lg font-bold text-zinc-100 mb-4">Macronutrientes</Text>
      
      <ProgressBar
        label="Proteínas"
        current={nutrients.protein}
        goal={dailyGoals.protein}
        unit="g"
        color={"bg-app-macro-protein"}
        icon="🥩"
      />
      
      <ProgressBar
        label="Carbohidratos"
        current={nutrients.carbs}
        goal={dailyGoals.carbs}
        unit="g"
        color={"bg-app-macro-carbs"}
        icon="🍞"
      />
      
      <ProgressBar
        label="Grasas"
        current={nutrients.fat}
        goal={dailyGoals.fat}
        unit="g"
        color={"bg-app-macro-fat"}
        icon="🥑"
      />
      
      {/* Fiber if available */}
      {nutrients.fiber && nutrients.fiber > 0 && (
        <View className="mt-2 pt-4 border-t border-zinc-700">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">🌾</Text>
              <Text className="text-zinc-100 font-medium">Fibra</Text>
            </View>
            <Text className="text-zinc-100 font-bold">
              {Math.round(nutrients.fiber)} g
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}