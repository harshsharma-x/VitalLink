import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

type Props = { color?: string; size?: number };

export default function PulseDot({ color = '#0D7A5F', size = 8 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 2.2, duration: 900, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Animated.View style={{
        position: 'absolute',
        width: size, height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ scale }],
        opacity,
      }} />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </View>
  );
}
