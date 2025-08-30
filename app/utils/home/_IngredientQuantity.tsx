import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import Slider from '@react-native-community/slider';

interface IngredientQuantityProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  ingredientName: string;
}

export function IngredientQuantity({
  value,
  min = 0,
  max = 500,
  step = 5,
  onChange,
  ingredientName
}: IngredientQuantityProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleDecrease = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleEditStart = () => {
    setInputValue(value.toString());
    setIsEditing(true);
  };

  const handleEditEnd = () => {
    const numValue = parseFloat(inputValue);
    
    if (isNaN(numValue)) {
      Alert.alert('Error', 'Por favor ingresa un número válido');
      setInputValue(value.toString());
    } else if (numValue < min || numValue > max) {
      Alert.alert('Error', `El valor debe estar entre ${min}g y ${max}g`);
      setInputValue(value.toString());
    } else {
      onChange(numValue);
    }
    
    setIsEditing(false);
  };

  const handleInputChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleanText = text.replace(/[^0-9.]/g, '');
    setInputValue(cleanText);
  };

  return (
    <View className="flex-row items-center bg-zinc-900/30 border border-zinc-800/40 rounded-lg px-3 py-2 mb-1">
      {/* Ingredient name */}
      <Text className="text-zinc-300 text-sm font-light flex-1 mr-3" numberOfLines={1}>
        {ingredientName}
      </Text>
      
      {/* Minus button */}
      <TouchableOpacity
        onPress={handleDecrease}
        className="bg-zinc-800/60 rounded-full w-7 h-7 items-center justify-center mr-2"
        accessibilityLabel={`Disminuir ${ingredientName}`}
      >
        <Text className="text-zinc-300 text-sm font-medium">−</Text>
      </TouchableOpacity>
      
      {/* Slider with usable size */}
      <View className="flex-1 mx-2">
        <Slider
          style={{ height: 30 }}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor="#22C55E"
          maximumTrackTintColor="#52525B"
          thumbTintColor="#16A34A"
          accessibilityLabel={`Cantidad de ${ingredientName}`}
        />
      </View>
      
      {/* Plus button */}
      <TouchableOpacity
        onPress={handleIncrease}
        className="bg-zinc-800/60 rounded-full w-7 h-7 items-center justify-center mr-2"
        accessibilityLabel={`Aumentar ${ingredientName}`}
      >
        <Text className="text-zinc-300 text-sm font-medium">+</Text>
      </TouchableOpacity>
      
      {/* Editable value */}
      {isEditing ? (
        <TextInput
          value={inputValue}
          onChangeText={handleInputChange}
          onBlur={handleEditEnd}
          onSubmitEditing={handleEditEnd}
          keyboardType="numeric"
          selectTextOnFocus
          autoFocus
          className="text-green-400 text-sm font-mono font-semibold min-w-[32px] text-right bg-zinc-800 px-1 rounded border border-green-500"
          style={{ minWidth: 40 }}
        />
      ) : (
        <TouchableOpacity onPress={handleEditStart}>
          <Text className="text-green-400 text-sm font-mono font-semibold min-w-[32px] text-right">
            {value}g
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}