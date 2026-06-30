import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { RS } from '../theme/RS';

type Kind = 'primary' | 'onAccent' | 'ghost' | 'ghostOnAccent' | 'teal';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  accent?: string;
  kind?: Kind;
  big?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
};

export default function RSBtn({
  children, onPress, accent = RS.accent, kind = 'primary',
  big = false, disabled = false, style, textStyle, loading = false,
}: Props) {
  const configs: Record<Kind, { bg: string; color: string; borderWidth?: number; borderColor?: string }> = {
    primary:       { bg: accent, color: RS.white },
    onAccent:      { bg: RS.white, color: accent },
    ghost:         { bg: 'transparent', color: RS.mid, borderWidth: 1.5, borderColor: RS.line },
    ghostOnAccent: { bg: 'rgba(255,255,255,0.14)', color: RS.white, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)' },
    teal:          { bg: RS.teal, color: RS.white },
  };
  const cfg = configs[kind];

  return (
    <TouchableOpacity
      onPress={disabled || loading ? undefined : onPress}
      activeOpacity={0.82}
      style={[{
        backgroundColor: cfg.bg,
        borderRadius: 12,
        paddingVertical: big ? 17 : 13,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        opacity: disabled ? 0.45 : 1,
        borderWidth: cfg.borderWidth ?? 0,
        borderColor: cfg.borderColor ?? 'transparent',
      }, style]}
    >
      {loading
        ? <ActivityIndicator color={cfg.color} />
        : <Text style={[{ color: cfg.color, fontWeight: '600', fontSize: big ? 17 : 15 }, textStyle]}>
            {children}
          </Text>
      }
    </TouchableOpacity>
  );
}
