import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Nutrients } from '../../(types)/domain';
import { macros } from '../../(config)/_colors';

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
      icon: 'flash-outline'
    },
    { 
      label: 'Proteínas', 
      short: <Ionicons name="barbell-outline" size={16} color={macros.protein} />, 
      value: Math.round(nutrients.protein), 
      color: "bg-app-macro-protein",
      unit: 'g',
      percentage: proteinPercentage,
      icon: 'barbell-outline'
    },
    { 
      label: 'Carbohidratos', 
      short: <Ionicons name="battery-charging-outline" size={16} color={macros.carbs} />, 
      value: Math.round(nutrients.carbs), 
      color: "bg-app-macro-carbs",
      unit: 'g',
      percentage: carbsPercentage,
      icon: 'battery-charging-outline'
    },
    { 
      label: 'Grasas', 
      short: <Ionicons name="water-outline" size={16} color={macros.fat} />, 
      value: Math.round(nutrients.fat), 
      color: "bg-app-macro-fat",
      unit: 'g',
      percentage: fatPercentage,
      icon: 'water-outline'
    },
  ];

  if (showPercentages) {
    return (
      <View className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4">
        {/* Total calories */}
        <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-center">
            <Ionicons name="flash-outline" size={24} color="#E11D48" style={{ marginRight: 8 }} />
            <Text className="text-zinc-100 font-semibold text-lg">
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
                  <Ionicons 
                    name={item.icon as any} 
                    size={18} 
                    color={
                      item.icon === 'barbell-outline' ? macros.protein : 
                      item.icon === 'battery-charging-outline' ? macros.carbs : 
                      item.icon === 'water-outline' ? macros.fat : '#a1a1aa'
                    } 
                    style={{ marginRight: 8 }} 
                  />
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
                  <Ionicons name="leaf-outline" size={18} color="#22c55e" style={{ marginRight: 8 }} />
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
    <View className="flex-row flex-wrap gap-2">
      {/* Calories */}
      <View className="bg-red-500/20 border border-red-500/30 px-3 py-2 rounded-lg flex-row items-center">
        <Ionicons name="flash-outline" size={16} color="#E11D48" style={{ marginRight: 6 }} />
        <Text className="text-zinc-100 text-xs font-medium mr-1">
          {Math.round(nutrients.kcal)}kcal
        </Text>
      </View>
      
      {/* Proteins */}
      <View className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-lg flex-row items-center">
        <Ionicons name="barbell-outline" size={16} color={macros.protein} style={{ marginRight: 6 }} />
        <Text className="text-zinc-100 text-xs font-medium mr-1">
          {Math.round(nutrients.protein)}g
        </Text>
      </View>
      
      {/* Carbohydrates */}
      <View className="bg-sky-500/20 border border-sky-500/30 px-3 py-2 rounded-lg flex-row items-center">
        <Ionicons name="battery-charging-outline" size={16} color={macros.carbs} style={{ marginRight: 6 }} />
        <Text className="text-zinc-100 text-xs font-medium mr-1">
          {Math.round(nutrients.carbs)}g
        </Text>
      </View>
      
      {/* Fats */}
      <View className="bg-orange-500/20 border border-orange-500/30 px-3 py-2 rounded-lg flex-row items-center">
        <Ionicons name="water-outline" size={16} color={macros.fat} style={{ marginRight: 6 }} />
        <Text className="text-zinc-100 text-xs font-medium mr-1">
          {Math.round(nutrients.fat)}g
        </Text>
      </View>
    </View>
  );
}