import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
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
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

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

  const handleEditStart = () => {
    setIsEditing(true);
    setInputValue(value.toString());
  };

  const handleEditEnd = () => {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue > 0) {
      const clampedValue = Math.max(minimumValue, numValue);
      onValueChange(clampedValue);
    }
    setIsEditing(false);
  };

  const handleInputChange = (text: string) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    setInputValue(cleanText);
  };

  const handleDecrease = () => {
    const newValue = Math.max(minimumValue, value - step);
    onValueChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(maximumValue, value + step);
    onValueChange(newValue);
  };

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-zinc-200 text-sm font-medium">{label}</Text>
        <View className="flex-row items-center">
          <View className="bg-zinc-800/40 border border-zinc-700/30 px-3 py-1.5 rounded-lg mr-2">
            {isEditing ? (
              <TextInput
                value={inputValue}
                onChangeText={handleInputChange}
                onBlur={handleEditEnd}
                onSubmitEditing={handleEditEnd}
                keyboardType="numeric"
                selectTextOnFocus
                autoFocus
                className="text-app-accent-success text-base font-mono font-semibold min-w-[40px] text-center"
                style={{ minWidth: 40 }}
              />
            ) : (
              <Pressable onPress={handleEditStart}>
                <Text className="text-app-accent-success text-base font-mono font-semibold">
                  {value}g
                </Text>
              </Pressable>
            )}
          </View>
          {showRemoveButton && onRemove && (
            <Pressable
              onPress={handleRemove}
              className="bg-red-500/90 hover:bg-red-500 rounded-lg p-1.5 border border-red-400/20"
              style={{ elevation: 2 }}
            >
              <Ionicons name="trash" size={12} color="white" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Controles integrados con slider */}
      <View className="flex-row items-center">
        <Pressable
          onPress={handleDecrease}
          disabled={disabled || value <= minimumValue}
          className={`bg-zinc-800/60 border border-zinc-700/40 rounded-lg w-8 h-8 items-center justify-center mr-2 ${
            disabled || value <= minimumValue ? 'opacity-40' : 'active:bg-zinc-700/60'
          }`}
        >
          <Ionicons 
            name="remove" 
            size={14} 
            color={disabled || value <= minimumValue ? '#52525b' : '#e4e4e7'} 
          />
        </Pressable>
        
        <View className="flex-1 mx-1">
          <Text className="text-zinc-500 text-xs text-center mb-1">
            {minimumValue}g - {maximumValue}g
          </Text>
        </View>
        
        <Pressable
          onPress={handleIncrease}
          disabled={disabled || value >= maximumValue}
          className={`bg-zinc-800/60 border border-zinc-700/40 rounded-lg w-8 h-8 items-center justify-center ml-2 ${
            disabled || value >= maximumValue ? 'opacity-40' : 'active:bg-zinc-700/60'
          }`}
        >
          <Ionicons 
            name="add" 
            size={14} 
            color={disabled || value >= maximumValue ? '#52525b' : '#e4e4e7'} 
          />
        </Pressable>
      </View>

      {!disabled ? (
        <View className="bg-app-surface-secondary rounded-lg p-0.5">
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
                margin: '12px 0',
              }}
            />
          </View>
        </View>
      ) : (
        <View className="bg-slate-600 rounded-lg p-2">
          <Text className="text-center text-slate-300 text-sm">Solo lectura</Text>
        </View>
      )}
    </View>
  );
}