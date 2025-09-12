import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME_COLORS } from '../(config)/_colors';

interface Food {
  barcode: any;
  name: string;
  brand?: string;
  carbohydrates: number;
  fat: number;
  proteins: number;
  calories: number;
}

interface FoodItemProps {
  food: Food;
  onPress: (food: Food) => void;
}

export default function FoodItem({ food, onPress }: FoodItemProps) {
  return (
    <Pressable
      className="flex-row items-start bg-app-surface-secondary/50 rounded-2xl p-5 mb-4 border border-app-surface-tertiary/30"
      onPress={() => onPress(food)}
      style={{ elevation: 2 }}
    >
      <View className="flex-1">
        {/* Header con nombre y botón */}
        <View className="flex-row items-start justify-between">
          <Text className="text-lg font-semibold text-app-text-primary flex-1 mr-2">
            {food.name}
          </Text>
          <View className="bg-app-accent-primary rounded-lg px-3 py-2.5 items-center justify-center shadow-sm">
            <View className="flex-row items-center gap-1">
              <Ionicons name="add" size={16} color="#000000" />
              <Text className="text-black font-medium text-xs">Añadir</Text>
            </View>
          </View>
        </View>
        
        {/* Marca */}
        {food.brand && (
          <Text className="text-app-text-secondary text-sm mb-3">{food.brand}</Text>
        )}
        
        {/* Badges de nutrientes */}
        <View className="flex-row flex-wrap gap-3 mt-2">
          {/* Calorías */}
          <View className="flex-row items-center">
            <Ionicons name="flash-outline" size={14} color={THEME_COLORS.macros.calories} style={{ marginRight: 4 }} />
            <Text className="text-xs text-app-text-secondary">
              <Text className="font-bold text-sm text-app-text-primary">{Math.round(food.calories)}</Text> kcal
            </Text>
          </View>
          
          {/* Carbohidratos */}
          <View className="flex-row items-center">
            <Ionicons name="battery-charging-outline" size={14} color={THEME_COLORS.macros.carbs} style={{ marginRight: 4 }} />
            <Text className="text-xs text-app-text-secondary">
              <Text className="font-bold text-sm text-app-text-primary">{Math.round(food.carbohydrates)}</Text>g
            </Text>
          </View>
          
          {/* Proteínas */}
          <View className="flex-row items-center">
            <Ionicons name="barbell-outline" size={14} color={THEME_COLORS.macros.protein} style={{ marginRight: 4 }} />
            <Text className="text-xs text-app-text-secondary">
              <Text className="font-bold text-sm text-app-text-primary">{Math.round(food.proteins)}</Text>g
            </Text>
          </View>
          
          {/* Grasas */}
          <View className="flex-row items-center">
            <Ionicons name="water-outline" size={14} color={THEME_COLORS.macros.fat} style={{ marginRight: 4 }} />
            <Text className="text-xs text-app-text-secondary">
              <Text className="font-bold text-sm text-app-text-primary">{Math.round(food.fat)}</Text>g
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}