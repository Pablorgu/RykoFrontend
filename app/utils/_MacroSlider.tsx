import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from '@expo/vector-icons';


// Macro Slider Component
export interface MacroSliderProps {
  label: string;
  value: number;
  onChange: (delta: number) => void;
  color?: string;
}

export function MacroSlider({ label, value, onChange, color }: MacroSliderProps) {
  return (
    <View>
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white text-sm">{label}</Text>
        <Text className="text-white text-sm font-medium">{value}%</Text>
      </View>
      
      <View className="flex-row items-center">
        <View className="flex-1 bg-gray-800 h-2 rounded-full mr-3">
          <View
            className="h-2 rounded-full"
            style={{
              width: `${value}%`,
              backgroundColor: color
            }}
          />
        </View>
        
        <View className="flex-row">
          <Pressable
            className="w-8 h-8 bg-gray-800 rounded-full justify-center items-center mr-2"
            onPress={() => onChange(-5)}
          >
            <Ionicons name="remove" size={16} color="#FFFFFF" />
          </Pressable>
          
          <Pressable
            className="w-8 h-8 bg-gray-800 rounded-full justify-center items-center"
            onPress={() => onChange(5)}          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}