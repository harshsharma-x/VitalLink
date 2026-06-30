import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { RS } from '../theme/RS';

type Props = { progress?: number; accent?: string; arrived?: boolean; compact?: boolean; height?: number };

const ROUTE_STEPS = [
  { left: '14%', top: '84%' },
  { left: '30%', top: '66%' },
  { left: '47%', top: '70%' },
  { left: '60%', top: '46%' },
  { left: '76%', top: '34%' },
  { left: '84%', top: '20%' },
];

function interpolateRoute(progress: number) {
  const p = Math.min(Math.max(progress, 0), 1);
  const idx = p * (ROUTE_STEPS.length - 1);
  const i = Math.floor(idx);
  const f = idx - i;
  if (i >= ROUTE_STEPS.length - 1) return ROUTE_STEPS[ROUTE_STEPS.length - 1];
  const a = ROUTE_STEPS[i];
  const b = ROUTE_STEPS[i + 1];
  return {
    left: `${parseFloat(a.left) + (parseFloat(b.left) - parseFloat(a.left)) * f}%`,
    top: `${parseFloat(a.top) + (parseFloat(b.top) - parseFloat(a.top)) * f}%`,
  };
}

export default function RouteMap({ progress = 0, accent = RS.accent, arrived = false, compact = false, height = 300 }: Props) {
  const pos = interpolateRoute(progress);
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseOp = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 2.5, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOp, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseOp, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const road = (style: object) => (
    <View style={[{ position: 'absolute', backgroundColor: '#E3DDD2' }, style]} />
  );

  const markerSize = compact ? 26 : 34;

  return (
    <View style={{ height, backgroundColor: '#EFEBE2', overflow: 'hidden', borderRadius: compact ? 12 : 0, flexShrink: 0, position: 'relative' }}>
      {road({ left: 0, right: 0, top: '30%', height: 10 })}
      {road({ left: 0, right: 0, top: '64%', height: 10 })}
      {road({ top: 0, bottom: 0, left: '24%', width: 10 })}
      {road({ top: 0, bottom: 0, left: '56%', width: 10 })}
      {road({ top: 0, bottom: 0, left: '80%', width: 8 })}

      <View style={{ position: 'absolute', left: '6%', top: '8%', width: '14%', height: '16%', backgroundColor: '#DCE8D8', borderRadius: 8 }} />
      <View style={{ position: 'absolute', left: '62%', top: '72%', width: '20%', height: '18%', backgroundColor: '#DCE8D8', borderRadius: 8 }} />
      <View style={{ position: 'absolute', left: '32%', top: '40%', width: '16%', height: '14%', backgroundColor: '#E7E2D7', borderRadius: 6 }} />

      {/* route dots */}
      {ROUTE_STEPS.slice(0, -1).map((step, i) => (
        <View key={i} style={{
          position: 'absolute', left: step.left, top: step.top,
          width: 6, height: 6, borderRadius: 3,
          backgroundColor: accent, opacity: 0.25,
          transform: [{ translateX: -3 }, { translateY: -3 }],
        }} />
      ))}

      {/* Hospital marker */}
      <View style={{
        position: 'absolute', left: '84%', top: '20%',
        transform: [{ translateX: -markerSize / 2 }, { translateY: -markerSize / 2 }],
        alignItems: 'center', gap: 3,
      }}>
        <View style={{
          width: markerSize, height: markerSize, borderRadius: 9,
          backgroundColor: RS.white, borderWidth: 2, borderColor: accent,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 4,
        }}>
          <Text style={{ color: accent, fontWeight: '800', fontSize: compact ? 15 : 19 }}>+</Text>
        </View>
        {!compact && (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: RS.ink }}>Apollo Hospital</Text>
          </View>
        )}
      </View>

      {/* Donor marker */}
      <View style={{
        position: 'absolute', left: pos.left, top: pos.top,
        transform: [{ translateX: compact ? -9 : -12 }, { translateY: compact ? -9 : -12 }],
      }}>
        <Animated.View style={{
          position: 'absolute',
          width: compact ? 18 : 24, height: compact ? 18 : 24,
          borderRadius: compact ? 9 : 12,
          backgroundColor: arrived ? RS.teal : accent,
          transform: [{ scale: pulse }],
          opacity: pulseOp,
        }} />
        <View style={{
          width: compact ? 18 : 24, height: compact ? 18 : 24,
          borderRadius: compact ? 9 : 12,
          backgroundColor: arrived ? RS.teal : accent,
          borderWidth: 3, borderColor: RS.white,
          shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
        }} />
      </View>
    </View>
  );
}
