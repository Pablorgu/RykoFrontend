import { ReactNode } from "react";
import { Pressable, View, Text } from "react-native";

export interface ProfileRowProps {
  label: string;
  value: string | number;
  rightElement?: ReactNode;
  onPress?: () => void;
}

export function ProfileRow({ label, value, rightElement, onPress }: ProfileRowProps) {
  return (
    <Pressable className="flex-row justify-between items-center py-2" onPress={onPress}>
      <View className="flex-1">
        <Text className="text-gray-400 text-sm">{label}</Text>
        <Text className="text-white text-base mt-1">{value}</Text>
      </View>
      {rightElement && (
        <View className="ml-4">
          {rightElement}
        </View>
      )}
    </Pressable>
  );
}