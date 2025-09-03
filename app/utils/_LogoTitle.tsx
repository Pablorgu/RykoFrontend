import React from 'react'
import { View, Text } from 'react-native'
import Logo from '../../assets/aguacate.svg'

const logoSize = 50

export function LogoTitle() {
  return (
    <View className="flex-row items-center justify-center">
      <Text
        className="text-white font-bold"
        style={{ fontSize: logoSize }}
      >
        RYK
      </Text>

      <Logo
        width={logoSize}
        height={logoSize * 0.80}
        style={{
          transform: [{ scaleX: 1.2 }, { scaleY: 1 }],
          marginLeft: -6,
          marginTop: 2,
        }}
      />
    </View>
  )
}
