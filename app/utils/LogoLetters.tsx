import React from 'react'
import { View, Text } from 'react-native'

const logoSize = 50

export function LogoLetters() {
  return (
    <View className="flex-row items-center">
      <Text
        className="text-white font-bold"
        style={{ fontSize: logoSize }}
      >
        RYKO
      </Text>
    </View>
  )
}
