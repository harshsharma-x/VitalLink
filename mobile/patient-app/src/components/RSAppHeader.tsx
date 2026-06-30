import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RS } from '../theme/RS';
import Drop from './Drop';

type Props = {
  accent?: string;
  name: string;
  sub?: string;
  right?: React.ReactNode;
  onBack?: () => void;
};

export default function RSAppHeader({ accent = RS.accent, name, sub, right, onBack }: Props) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12,
      backgroundColor: RS.white, borderBottomWidth: 1, borderBottomColor: RS.line,
      flexShrink: 0,
    }}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={{
          width: 32, height: 32, borderRadius: 9, backgroundColor: RS.fog,
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Text style={{ fontSize: 20, color: RS.ink, lineHeight: 24 }}>‹</Text>
        </TouchableOpacity>
      ) : (
        <Drop size={16} color={accent} />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: RS.ink, letterSpacing: -0.2 }} numberOfLines={1}>{name}</Text>
        {sub ? <Text style={{ fontSize: 11.5, color: RS.mid }} numberOfLines={1}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}
