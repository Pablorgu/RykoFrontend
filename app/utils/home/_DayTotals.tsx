import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Nutrients } from '../../(types)/domain';
import { useAuthStore } from '../../(store)/authStore';
import { macros } from '../../(config)/_colors';

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
  icon?: string;
}

// Function to render progress bars
function ProgressBar({ label, current, goal, unit, color, icon }: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isOverGoal = current > goal;

  const getIconColor = (iconName: string) => {
    switch (iconName) {
      case 'barbell-outline': return macros.protein;
      case 'battery-charging-outline': return macros.carbs;
      case 'water-outline': return macros.fat;
      case 'leaf-outline': return '#22c55e'; // Fibra (accent-success)
      default: return '#71717a';
    }
  };

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          {icon && <Ionicons name={icon as any} size={18} color={getIconColor(icon)} style={{ marginRight: 8 }} />}
          <Text className="text-zinc-200 font-medium text-sm">{label}</Text>
        </View>
        <Text className="font-semibold text-sm">
          <Text className={isOverGoal ? 'text-red-400' : 'text-zinc-100'}>
            {Math.round(current)}
          </Text>
          <Text className={isOverGoal ? 'text-red-400 font-normal' : 'text-zinc-400 font-normal'}>/{Math.round(goal)}</Text>
          <Text className={isOverGoal ? 'text-red-400' : 'text-zinc-100'}> {unit}</Text>
        </Text>
      </View>
      
      <View className="bg-zinc-800/60 rounded-full h-1.5 overflow-hidden">
        <View
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </View>
      
      {isOverGoal && (
        <Text className="text-red-400 text-xs mt-1.5 font-medium">
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
      <Text className="text-lg font-semibold text-zinc-100 mb-5 text-center">
        Resumen del día
      </Text>
      
      {/* Main calories */}
      <View className="bg-zinc-800 rounded-lg p-4 mb-5">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-zinc-100 font-bold text-lg">Calorías totales</Text>
          <Text className="text-2xl font-bold text-app-macro-calories">
            {Math.round(nutrients.kcal)}
          </Text>
        </View>
        <View className="bg-zinc-700 rounded-full h-3 overflow-hidden">
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
      <Text className="text-sm font-semibold text-zinc-200 mb-4 uppercase tracking-wide">Macronutrientes</Text>
      
      <ProgressBar
        label="Proteínas"
        current={nutrients.protein}
        goal={dailyGoals.protein}
        unit="g"
        color={"bg-app-macro-protein"}
        icon="barbell-outline"
      />
      
      <ProgressBar
        label="Carbohidratos"
        current={nutrients.carbs}
        goal={dailyGoals.carbs}
        unit="g"
        color={"bg-app-macro-carbs"}
        icon="battery-charging-outline"
      />
      
      <ProgressBar
        label="Grasas"
        current={nutrients.fat}
        goal={dailyGoals.fat}
        unit="g"
        color={"bg-app-macro-fat"}
        icon="water-outline"
      />
      
      {/* Fiber */}
      {nutrients.fiber && nutrients.fiber > 0 && (
        <View className="mt-4 pt-4 border-t border-zinc-800/60">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="leaf-outline" size={18} color="#22c55e" style={{ marginRight: 8 }} />
              <Text className="text-zinc-200 font-medium text-sm">Fibra</Text>
            </View>
            <Text className="text-zinc-100 font-semibold text-sm">
              {Math.round(nutrients.fiber)}g
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}