import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Ionicons } from '@expo/vector-icons';
import { THEME_COLORS } from '../(config)/_colors';

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

  const handleSliderChange = useCallback((newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setSliderValue(value);
  }, []);

  const handleSliderComplete = useCallback((newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    const roundedValue = Math.max(minimumValue, Math.round(value));
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
          <View className="px-3 py-1 rounded-full mr-2">
            <Text className="text-app-accent-success text-lg font-mono font-semibold mb-2">
              {value}g
            </Text>
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
          <View style={{ overflow: 'hidden' }}>
            <Slider
              min={minimumValue}
              max={maximumValue}
              value={sliderValue}
              step={step}
              onChange={handleSliderChange}
              onChangeComplete={handleSliderComplete}
              styles={{
                track: {
                  backgroundColor: THEME_COLORS.accent.success,
                },
                rail: {
                  backgroundColor: '#52525B',
                },
                handle: {
                  backgroundColor: THEME_COLORS.accent.success,
                  borderColor: THEME_COLORS.accent.success,
                  boxShadow: `0 0 0 2px ${THEME_COLORS.accent.success}20`,
                },
              }}
              style={{
                width: '100%',
                margin: '20px 0',
              }}
            />
          </View>
        </View>
      ) : (
        <View className="bg-slate-600 rounded-full p-3">
          <Text className="text-center text-slate-300 text-sm">Solo lectura</Text>
        </View>
      )}
    </View>
  );
}