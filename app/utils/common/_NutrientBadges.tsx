import React from 'react';
import { View, Text } from 'react-native';
import { Nutrients } from '../../(types)/domain';

interface NutrientBadgesProps {
  nutrients: Nutrients;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showPercentages?: boolean;
}

export function NutrientBadges({ 
  nutrients, 
  size = 'md', 
  showPercentages = false
}: NutrientBadgesProps) {
  const sizeClasses = {
    xs: 'px-1 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  // Calculate macronutrient percentages
  const totalCalories = nutrients.kcal;
  const proteinCalories = nutrients.protein * 4; // 4 kcal per gram
  const carbsCalories = nutrients.carbs * 4; // 4 kcal per gram
  const fatCalories = nutrients.fat * 9; // 9 kcal per gram

  const proteinPercentage = totalCalories > 0 ? Math.round((proteinCalories / totalCalories) * 100) : 0;
  const carbsPercentage = totalCalories > 0 ? Math.round((carbsCalories / totalCalories) * 100) : 0;
  const fatPercentage = totalCalories > 0 ? Math.round((fatCalories / totalCalories) * 100) : 0;

  const nutritionData = [
    { 
      label: 'Calorías', 
      short: 'Kcal', 
      value: Math.round(nutrients.kcal), 
      color: "bg-app-macro-calories",
      icon: '🔥'
    },
    { 
      label: 'Proteínas', 
      short: 'P', 
      value: Math.round(nutrients.protein), 
      color: "bg-app-macro-protein",
      unit: 'g',
      percentage: proteinPercentage,
      icon: '🥩'
    },
    { 
      label: 'Carbohidratos', 
      short: 'C', 
      value: Math.round(nutrients.carbs), 
      color: "bg-app-macro-carbs",
      unit: 'g',
      percentage: carbsPercentage,
      icon: '🍞'
    },
    { 
      label: 'Grasas', 
      short: 'G', 
      value: Math.round(nutrients.fat), 
      color: "bg-app-macro-fat",
      unit: 'g',
      percentage: fatPercentage,
      icon: '🥑'
    },
  ];

  if (showPercentages) {
    return (
      <View className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4">
        {/* Total calories */}
        <View className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-3 mb-4">
          <View className="flex-row items-center justify-center">
            <Text className="text-2xl mr-3">🔥</Text>
            <Text className="text-orange-300 font-bold text-xl">
              {Math.round(nutrients.kcal)} kcal
            </Text>
          </View>
        </View>

        {/* Macronutrient table */}
        <View className="space-y-0">
          <Text className="text-zinc-300 font-semibold text-center mb-3 text-sm">Distribución de macronutrientes</Text>
          
          {/* Table header */}
          <View className="flex-row items-center py-2 border-b border-zinc-700/50">
            <View className="flex-1">
              <Text className="text-zinc-400 font-medium text-xs">NUTRIENTE</Text>
            </View>
            <View className="w-16 items-center">
              <Text className="text-zinc-400 font-medium text-xs">CANTIDAD</Text>
            </View>
            <View className="w-12 items-center">
              <Text className="text-zinc-400 font-medium text-xs">%</Text>
            </View>
          </View>
          
          {nutritionData.slice(1, 4).map((item, index) => (
            <View key={index}>
              <View className="flex-row items-center py-3">
                {/* Nutrient column */}
                <View className="flex-row items-center flex-1">
                  <Text className="text-lg mr-3">{item.icon}</Text>
                  <Text className="text-zinc-200 font-medium text-sm">{item.label}</Text>
                </View>
                
                {/* Amount column */}
                <View className="w-16 items-center">
                  <Text className="text-zinc-100 font-bold text-sm">
                    {item.value}{item.unit}
                  </Text>
                </View>
                
                {/* Percentage column */}
                <View className="w-12 items-center">
                  <View className={`${item.color} rounded-full px-2 py-1 min-w-[32px]`}>
                    <Text className="text-white font-bold text-center text-xs">
                      {item.percentage}%
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Dividing line between rows */}
              {index < 2 && (
                <View className="border-b border-zinc-800/40" />
              )}
            </View>
          ))}
          
          {/* Fiber if exist*/}
          {nutrients.fiber && nutrients.fiber > 0 && (
            <>
              <View className="border-b border-zinc-800/40" />
              <View className="flex-row items-center py-3">
                <View className="flex-row items-center flex-1">
                  <Text className="text-lg mr-3">🌾</Text>
                  <Text className="text-zinc-200 font-medium text-sm">Fibra</Text>
                </View>
                <View className="w-16 items-center">
                  <Text className="text-zinc-100 font-bold text-sm">
                    {Math.round(nutrients.fiber)}g
                  </Text>
                </View>
                <View className="w-12" />
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  // Compact version for badges
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {/* Calories */}
      <View className="bg-app-macro-calories px-2.5 py-1 rounded-md border border-app-macro-calories/60">
        <Text className="text-white text-xs font-medium">
          {Math.round(nutrients.kcal)}
        </Text>
        <Text className="text-white text-[10px] uppercase tracking-wide">
          calorías
        </Text>
      </View>
      
      {/* Proteins */}
      <View className="bg-app-macro-protein px-2.5 py-1 rounded-md border border-app-macro-protein/60">
        <Text className="text-white text-xs font-medium">
          {Math.round(nutrients.protein)}g
        </Text>
        <Text className="text-white/70 text-[10px] uppercase tracking-wide">
          proteínas
        </Text>
      </View>
      
      {/* Carbohydrates */}
      <View className="bg-app-macro-carbs px-2.5 py-1 rounded-md border border-app-macro-carbs/60">
        <Text className="text-white text-xs font-medium">
          {Math.round(nutrients.carbs)}g
        </Text>
        <Text className="text-white/70 text-[10px] uppercase tracking-wide">
          carbohidratos
        </Text>
      </View>
      
      {/* Fats */}
      <View className="bg-app-macro-fat px-2.5 py-1 rounded-md border border-app-macro-fat/60">
        <Text className="text-white text-xs font-medium">
          {Math.round(nutrients.fat)}g
        </Text>
        <Text className="text-white/70 text-[10px] uppercase tracking-wide">
          grasas
        </Text>
      </View>
    </View>
  );
}