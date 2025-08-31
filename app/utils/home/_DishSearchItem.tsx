import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getDishById } from '../../services/dishService';
import { nutrientsForDish } from '../../(types)/nutrition';
import { Dish, Nutrients } from '../../(types)/domain';

interface DishSearchItemProps {
  dish: Dish;
  onPress: (dishId: string) => void;
}

export function DishSearchItem({ dish, onPress }: DishSearchItemProps) {
  const [nutrients, setNutrients] = useState<Nutrients>({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNutrients = async () => {
      try {
        const detailedDish = await getDishById(dish.id);
        if (detailedDish && detailedDish.ingredients) {
          const calculatedNutrients = nutrientsForDish(detailedDish);
          setNutrients(calculatedNutrients);
        }
      } catch (error) {
        console.error('Error fetching dish nutrients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNutrients();
  }, [dish.id]);

  return (
    <TouchableOpacity
      className="p-4 border-b border-zinc-800"
      onPress={() => onPress(dish.id)}
    >
      <Text className="text-zinc-100 font-medium">{dish.name}</Text>
      <Text className="text-zinc-400 text-sm mt-1">
        {loading ? 'Calculando...' : 
          `${Math.round(nutrients.kcal)} kcal • ${Math.round(nutrients.protein)}g proteína • ${Math.round(nutrients.carbs)}g carbohidratos • ${Math.round(nutrients.fat)}g grasas`
        }
      </Text>
    </TouchableOpacity>
  );
}