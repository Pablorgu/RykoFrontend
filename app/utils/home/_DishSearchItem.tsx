import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DishSummary } from '../../(types)/domain';

interface DishSearchItemProps {
  dish: DishSummary;
  onPress: (dishId: string) => void;
  disabled?: boolean;
}

export function DishSearchItem({ dish, onPress, disabled = false }: DishSearchItemProps) {

  return (
    <TouchableOpacity
      className={`p-4 border-b border-zinc-800 ${disabled ? 'opacity-50' : ''}`}
      onPress={() => !disabled && onPress(dish.id)}
      disabled={disabled}
    >
      <Text className="text-zinc-100 font-medium">{dish.name}</Text>
      <Text className="text-zinc-400 text-sm mt-1">
        {`${Math.round(dish.nutrients.kcal)} kcal • ${Math.round(dish.nutrients.protein)}g proteína • ${Math.round(dish.nutrients.carbs)}g carbohidratos • ${Math.round(dish.nutrients.fat)}g grasas`}
      </Text>
    </TouchableOpacity>
  );
}