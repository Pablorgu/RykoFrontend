import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

interface QuantitySliderProps {
  value: number;
  onValueChange: (value: number) => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
}

export default function QuantitySlider({
  value,
  onValueChange,
  onRemove,
  showRemoveButton = false,
  minimumValue = 5,
  maximumValue = 500,
  step = 5,
  disabled = false,
  label = 'Cantidad'
}: QuantitySliderProps) {
  const [sliderValue, setSliderValue] = useState(value);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    if (!isSliding) {
      setSliderValue(value);
    }
  }, [value, isSliding]);

  const displayQuantity = isSliding ? sliderValue : value;

  const handleSliderStart = useCallback(() => {
    setIsSliding(true);
  }, []);

  const handleSliderChange = useCallback((newValue: number) => {
    setSliderValue(newValue);
  }, []);

  const handleSliderComplete = useCallback((newValue: number) => {
    const roundedValue = Math.max(minimumValue, Math.round(newValue));
    setSliderValue(roundedValue);
    setIsSliding(false);
    onValueChange(roundedValue);
  }, [minimumValue, onValueChange]);

  const handleRemove = useCallback(() => {
    onRemove?.();
  }, [onRemove]);

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-slate-300 text-sm font-medium">{label}</Text>
        <View className="flex-row items-center">
          <View className="bg-[#A3FF57] px-3 py-1 rounded-full mr-2">
            <Text className="text-black font-bold text-sm">{Math.round(displayQuantity)}g</Text>
          </View>
          {showRemoveButton && onRemove && (
            <Pressable
              onPress={handleRemove}
              className="bg-red-500 rounded-full p-2"
              style={{ elevation: 3 }}
            >
              <Ionicons name="trash" size={14} color="white" />
            </Pressable>
          )}
        </View>
      </View>

      {!disabled ? (
        <View className="bg-app-surface-secondary rounded-full p-1">
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={minimumValue}
            maximumValue={maximumValue}
            value={sliderValue}
            onSlidingStart={handleSliderStart}
            onValueChange={handleSliderChange}
            onSlidingComplete={handleSliderComplete}
            minimumTrackTintColor="#A3FF57"
            maximumTrackTintColor="#475569"
            thumbTintColor="#A3FF57"
            step={step}
          />
        </View>
      ) : (
        <View className="bg-slate-600 rounded-full p-3">
          <Text className="text-center text-slate-300 text-sm">Solo lectura</Text>
        </View>
      )}
    </View>
  );
}