import React from 'react';
import { View, Text } from 'react-native';
import { Nutrients } from '../../(types)/domain';
import { THEME_COLORS } from '../../(config)/_colors';

interface DayTotalsProps {
  nutrients: Nutrients;
}

// Example daily goals
const DAILY_GOALS = {
  kcal: 2000,
  protein: 150, // grams
  carbs: 250,   // grams
  fat: 67,      // grams
};

interface ProgressBarProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  icon: string;
}

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
  const caloriesPercentage = (nutrients.kcal / DAILY_GOALS.kcal) * 100;
  
  return (
    <View className="bg-zinc-900 rounded-xl p-6 mx-5 mb-6">
      <Text className="text-xl font-bold text-zinc-100 mb-6 text-center">
        📊 Resumen del día
      </Text>
      
      {/* Main calories */}
      <View className="bg-zinc-800 rounded-lg p-4 mb-6">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-zinc-100 font-bold text-lg">Calorías totales</Text>
          <Text className="text-2xl font-bold text-blue-400">
            {Math.round(nutrients.kcal)}
          </Text>
        </View>
        <View className="bg-zinc-700 rounded-full h-4 overflow-hidden">
          <View
            className="h-full bg-blue-500 rounded-full"
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
        goal={DAILY_GOALS.protein}
        unit="g"
        color={"bg-app-macro-protein"}
        icon="🥩"
      />
      
      <ProgressBar
        label="Carbohidratos"
        current={nutrients.carbs}
        goal={DAILY_GOALS.carbs}
        unit="g"
        color={"bg-app-macro-carbs"}
        icon="🍞"
      />
      
      <ProgressBar
        label="Grasas"
        current={nutrients.fat}
        goal={DAILY_GOALS.fat}
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