import React from 'react';
import { View, ViewStyle } from 'react-native';

type Props = { size?: number; color?: string; style?: ViewStyle };

export default function Drop({ size = 18, color = '#C0152A', style }: Props) {
  return (
    <View style={[{
      width: size,
      height: size,
      backgroundColor: color,
      borderTopLeftRadius: 0,
      borderTopRightRadius: size,
      borderBottomRightRadius: size,
      borderBottomLeftRadius: size,
      transform: [{ rotate: '45deg' }],
      flexShrink: 0,
    }, style]} />
  );
}
