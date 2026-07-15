import React from 'react';
import { Text, TextStyle } from 'react-native';
import { RS } from '../theme/RS';

type Props = { children: React.ReactNode; style?: TextStyle };

export default function RSLabel({ children, style }: Props) {
  return (
    <Text style={[{
      fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
      textTransform: 'uppercase', color: RS.faint, marginBottom: 8,
    }, style]}>
      {children}
    </Text>
  );
}
