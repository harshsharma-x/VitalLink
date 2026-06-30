import React from 'react';
import { View, ViewStyle } from 'react-native';
import { RS } from '../theme/RS';

type Props = { children: React.ReactNode; style?: ViewStyle };

export default function RSCard({ children, style }: Props) {
  return (
    <View style={[{
      backgroundColor: RS.white,
      borderWidth: 1, borderColor: RS.line,
      borderRadius: 14, padding: 16,
    }, style]}>
      {children}
    </View>
  );
}
