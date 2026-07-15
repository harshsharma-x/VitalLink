import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../../theme/RS';
import Drop from '../../components/Drop';
import RSCard from '../../components/RSCard';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export default function CompleteScreen({ navigation, route }: Props) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <View style={s.header}>
        <Drop size={20} color={RS.white} />
        <Text style={s.headerText}>VitalLink</Text>
      </View>
      <Animated.View style={[s.heroCard, { opacity: fadeIn, transform: [{ scale }] }]}>
        <View style={s.checkCircle}><Text style={{ color: RS.white, fontSize: 36, fontWeight: '700' }}>✓</Text></View>
        <Text style={s.heroTitle}>You saved a life.</Text>
        <Text style={s.heroSub}>1 donation can save up to 3 lives. The family thanks you.</Text>
      </Animated.View>
      <Animated.View style={[{ flex: 1, padding: 18, gap: 14 }, { opacity: fadeIn }]}>
        <RSCard style={{ gap: 12 }}>
          <Text style={s.sectionLabel}>RELIABILITY SCORE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Text style={[s.scoreBig, { color: RS.teal }]}>94</Text>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontFamily: MONO, fontSize: 13, fontWeight: '700', color: RS.teal }}>+2</Text>
                <Text style={{ fontSize: 12, color: RS.mid }}>from this donation</Text>
              </View>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: '94%' }]} />
              </View>
              <Text style={{ fontSize: 10.5, color: RS.faint, marginTop: 4 }}>Top 8% of donors in Ludhiana</Text>
            </View>
          </View>
        </RSCard>
        <RSCard style={{ gap: 6 }}>
          <Text style={s.sectionLabel}>NEXT ELIGIBLE DATE</Text>
          <Text style={{ fontFamily: MONO, fontWeight: '700', fontSize: 18, color: RS.ink }}>14 Sep 2025</Text>
          <Text style={{ fontSize: 11.5, color: RS.mid }}>90 days after today · whole blood (O+)</Text>
        </RSCard>
        <TouchableOpacity style={s.homeBtn} onPress={() => navigation.replace('DonorHome')} activeOpacity={0.85}>
          <Text style={{ color: RS.white, fontWeight: '700', fontSize: 15 }}>Back to dashboard</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: RS.teal, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { color: RS.white, fontWeight: '800', fontSize: 16 },
  heroCard: { backgroundColor: RS.teal, paddingHorizontal: 28, paddingBottom: 32, paddingTop: 8, alignItems: 'center', gap: 10 },
  checkCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: RS.white, textAlign: 'center' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 20 },
  sectionLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1, color: RS.faint, textTransform: 'uppercase' },
  scoreBig: { fontFamily: MONO, fontWeight: '700', fontSize: 48 },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: RS.steal, overflow: 'hidden', marginTop: 6, width: 160 },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: RS.teal },
  homeBtn: { backgroundColor: RS.ink, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
});
