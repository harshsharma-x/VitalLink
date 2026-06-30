import React from 'react';
import { View, Text } from 'react-native';
import { RS, MONO } from '../theme/RS';

type Props = { group: string; accent?: string; size?: 'md' | 'lg' };

export default function BloodTag({ group, accent = RS.accent, size = 'md' }: Props) {
  const dim = size === 'lg' ? 54 : 40;
  const fontSize = size === 'lg' ? 20 : 14;
  return (
    <View style={{
      width: dim, height: dim, borderRadius: 10,
      backgroundColor: RS.soft,
      borderWidth: 1.5, borderColor: accent,
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Text style={{ fontFamily: MONO, fontWeight: '700', fontSize, color: accent }}>{group}</Text>
    </View>
  );
}
