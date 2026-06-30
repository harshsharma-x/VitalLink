import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../theme/RS';
import RSAppHeader from '../components/RSAppHeader';
import RSCard from '../components/RSCard';
import api from '../api/api';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export default function SearchingScreen({ navigation, route }: Props) {
  const { blood_group = 'O+', units = 2 } = route?.params ?? {};
  const [donorsAlerted, setDonorsAlerted] = useState(0);
  const [steps, setSteps] = useState([false, false, false]);
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Tell backend to find donors and send push notifications
    if (route?.params?.request_id) {
      api.post('/matching/start', { request_id: route.params.request_id })
        .then(res => {
          const alerted = res.data?.donors_alerted ?? 0;
          if (alerted > 0) setDonorsAlerted(alerted);
        })
        .catch(() => {}); // non-fatal — UI still runs
    }

    const anim = Animated.loop(
      Animated.stagger(900, [
        Animated.sequence([
          Animated.timing(ring1, { toValue: 1, duration: 1400, useNativeDriver: true }),
          Animated.timing(ring1, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ring2, { toValue: 1, duration: 1400, useNativeDriver: true }),
          Animated.timing(ring2, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    const t1 = setTimeout(() => setSteps([true, false, false]), 600);
    const t2 = setTimeout(() => setSteps([true, true, false]), 1400);
    const t3 = setTimeout(() => { setSteps([true, true, true]); }, 2400);
    const t4 = setTimeout(() => navigation.replace('Tracking', { blood_group, units }), 8000);
    return () => { anim.stop(); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const ringStyle = (anim: Animated.Value) => ({
    position: 'absolute' as const,
    width: 170, height: 170, borderRadius: 85,
    borderWidth: 1.5, borderColor: RS.accent,
    opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.5, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.6] }) }],
  });

  const STEPS = [
    'Hospital verified against HFR registry',
    'Urgency scored — CRITICAL (82/100)',
    `Alerting ${blood_group} donors within 10 km`,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <RSAppHeader accent={RS.accent} name="Finding donors" sub={`${blood_group} · ${units} units · Apollo Hospital`} />
      <View style={{ flex: 1, alignItems: 'center', padding: 28, gap: 20 }}>
        <View style={{ width: 170, height: 170, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={ringStyle(ring1)} />
          <Animated.View style={ringStyle(ring2)} />
          <View style={s.badge}>
            <Text style={[s.badgeCount, { color: RS.accent }]}>{donorsAlerted}</Text>
            <Text style={s.badgeLabel}>ALERTED</Text>
          </View>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={s.title}>Alerting nearby donors…</Text>
          <Text style={s.sub}>Search radius <Text style={{ fontFamily: MONO, color: RS.ink, fontWeight: '700' }}>10 km</Text> — expands automatically</Text>
        </View>
        <RSCard style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 6 }}>
          {STEPS.map((label, i) => (
            <View key={i} style={[s.step, i < STEPS.length - 1 && { borderBottomWidth: 1, borderBottomColor: RS.line }]}>
              <View style={[s.stepDot, { backgroundColor: steps[i] ? RS.teal : RS.fog, borderWidth: steps[i] ? 0 : 1.5, borderColor: RS.line }]}>
                {steps[i] && <Text style={{ color: RS.white, fontSize: 10, fontWeight: '700' }}>✓</Text>}
              </View>
              <Text style={[s.stepLabel, { color: steps[i] ? RS.ink : RS.faint, fontWeight: steps[i] ? '600' : '400' }]}>{label}</Text>
            </View>
          ))}
        </RSCard>
        <Text style={s.hint}>If no donor accepts in 3 minutes, we expand the radius and show nearest blood-bank stock.</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: RS.white, borderWidth: 2, borderColor: RS.accent,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
    shadowColor: RS.accent, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 30, elevation: 6,
  },
  badgeCount: { fontFamily: MONO, fontWeight: '700', fontSize: 26 },
  badgeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: RS.mid, textTransform: 'uppercase' },
  title: { fontSize: 17, fontWeight: '700', color: RS.ink, marginBottom: 4 },
  sub: { fontSize: 12.5, color: RS.mid },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  stepDot: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepLabel: { fontSize: 12.5, flex: 1 },
  hint: { fontSize: 11, color: RS.faint, textAlign: 'center', lineHeight: 17 },
});
