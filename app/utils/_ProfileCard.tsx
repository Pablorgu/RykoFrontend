import { View, Text } from "react-native";


export interface ProfileCardProps {
  title: string;
  children: React.ReactNode;
}

export function ProfileCard({ title, children }:ProfileCardProps) {
  return (
    <View className="bg-zinc-900 rounded-2xl p-6 mb-4" style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4
    }}>
      <Text className="text-white text-lg font-semibold mb-4">{title}</Text>
      
      <View className="space-y-4">
        {children}
      </View>
    </View>
  );
}
