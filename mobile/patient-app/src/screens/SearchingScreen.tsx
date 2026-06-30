import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../theme/RS';
import RSAppHeader from '../components/RSAppHeader';
import RSCard from '../components/RSCard';
import api from '../api/api';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

const POLL_INTERVAL_MS = 4000;
const MAX_WAIT_MS = 3 * 60 * 1000; // 3 minutes

type MatchStatus = {
  status: 'pending' | 'searching' | 'accepted' | 'cancelled';
  donors_alerted: number;
  accepted_match: {
    match_id: string;
    donor_name: string;
    blood_group: string;
    reliability_score: number;
    donation_count: number;
  } | null;
};

export default function SearchingScreen({ navigation, route }: Props) {
  const { blood_group = 'O+', units = 2, urgency = 'critical', request_id } = route?.params ?? {};
  const [donorsAlerted, setDonorsAlerted] = useState(0);
  const [steps, setSteps] = useState([false, false, false]);
  const [phase, setPhase] = useState<'searching' | 'expanding' | 'timeout'>('searching');
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const startedAt = useRef(Date.now());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Animate steps progressively
    const t1 = setTimeout(() => setSteps([true, false, false]), 600);
    const t2 = setTimeout(() => setSteps([true, true, false]), 1400);
    const t3 = setTimeout(() => setSteps([true, true, true]), 2400);

    // Pulse rings
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

    // Poll matching status
    if (request_id) {
      const poll = async () => {
        try {
          const res = await api.get<MatchStatus>(`/matching/status/${request_id}`);
          const { status, donors_alerted, accepted_match } = res.data;

          setDonorsAlerted(donors_alerted);

          const elapsed = Date.now() - startedAt.current;

          if (status === 'accepted' && accepted_match) {
            clearInterval(pollRef.current!);
            anim.stop();
            navigation.replace('Tracking', {
              blood_group,
              units,
              request_id,
              match_id: accepted_match.match_id,
              donor_name: accepted_match.donor_name,
              donor_group: accepted_match.blood_group,
              reliability_score: accepted_match.reliability_score,
              donation_count: accepted_match.donation_count,
            });
            return;
          }

          if (elapsed > 45000 && donors_alerted === 0) {
            setPhase('expanding');
          }
          if (elapsed > MAX_WAIT_MS) {
            clearInterval(pollRef.current!);
            setPhase('timeout');
          }
        } catch {}
      };

      poll(); // immediate first poll
      pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    }

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      anim.stop();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [request_id]);

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
    `Alerting ${blood_group} donors within 15 km`,
  ];

  if (phase === 'timeout') {
    return (
      <View style={{ flex: 1, backgroundColor: RS.fog }}>
        <RSAppHeader accent={RS.accent} name="Finding donors" sub={`${blood_group} · ${units} units`} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 18 }}>
          <View style={[s.badge, { borderColor: RS.amber }]}>
            <Text style={[s.badgeCount, { color: RS.amber }]}>0</Text>
            <Text style={s.badgeLabel}>ALERTED</Text>
          </View>
          <Text style={{ fontSize: 17, fontWeight: '700', color: RS.ink, textAlign: 'center' }}>
            No donors available right now
          </Text>
          <Text style={{ fontSize: 13, color: RS.mid, textAlign: 'center', lineHeight: 20 }}>
            We searched within 50 km. Try again in a few minutes or check a nearby blood bank.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: RS.accent, borderRadius: 12, paddingVertical: 15, paddingHorizontal: 28, marginTop: 8 }}
            onPress={() => navigation.navigate('BloodBanks')}
          >
            <Text style={{ color: RS.white, fontWeight: '700', fontSize: 14 }}>Check blood banks</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.replace('Home')}>
            <Text style={{ color: RS.mid, fontSize: 13 }}>← Go back home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <RSAppHeader accent={RS.accent} name="Finding donors" sub={`${blood_group} · ${units} units`} />
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
          <Text style={s.title}>
            {phase === 'expanding' ? 'Expanding search radius…' : 'Alerting nearby donors…'}
          </Text>
          <Text style={s.sub}>
            {phase === 'expanding'
              ? `No donors found nearby — trying up to `
              : `Search radius `}
            <Text style={{ fontFamily: MONO, color: RS.ink, fontWeight: '700' }}>
              {phase === 'expanding' ? '50 km' : '15 km'}
            </Text>
            {phase === 'expanding' ? '' : ' — expands automatically'}
          </Text>
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

        <Text style={s.hint}>
          {donorsAlerted > 0
            ? `${donorsAlerted} donor${donorsAlerted > 1 ? 's' : ''} alerted — waiting for response…`
            : 'Searching for compatible donors. This takes up to 3 minutes.'}
        </Text>
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
  title: { fontSize: 17, fontWeight: '700', color: RS.ink, marginBottom: 4, textAlign: 'center' },
  sub: { fontSize: 12.5, color: RS.mid, textAlign: 'center' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  stepDot: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepLabel: { fontSize: 12.5, flex: 1 },
  hint: { fontSize: 11, color: RS.faint, textAlign: 'center', lineHeight: 17 },
});
