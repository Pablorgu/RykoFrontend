import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  inputProps?: TextInputProps;
}

export default function FloatingLabelInput({
  label,
  value,
  onChangeText,
  inputProps = {},
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute' as const,
    left: 12,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: '#aaa',
    backgroundColor: '#000',
    paddingHorizontal: 4,
  };

  return (
    <View >
      <View style={styles.container}>
        <Animated.Text
          style={labelStyle}
          pointerEvents="none"
        >
          {label}
        </Animated.Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=""
          placeholderTextColor="#ccc"
          {...inputProps}
        />
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 56,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: '#fff',
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    textAlignVertical: 'center',
    outlineWidth: 0,
  },
});

