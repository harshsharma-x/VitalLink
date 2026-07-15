import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../../theme/RS';
import RSAppHeader from '../../components/RSAppHeader';
import RSCard from '../../components/RSCard';
import RSBtn from '../../components/RSBtn';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

const STEPS = [
  { id: 'id', label: 'ID verified by hospital staff', sub: 'Show your ABHA QR or any govt. photo ID' },
  { id: 'screen', label: 'Pre-donation screening done', sub: 'BP, Hb, weight check — takes ~5 min' },
  { id: 'donate', label: 'Blood collected (1 unit ≈ 450 ml)', sub: 'Takes 8–10 minutes. Stay relaxed.' },
  { id: 'rest', label: 'Post-donation rest (15 min)', sub: 'Have juice and biscuits provided by staff' },
];

export default function DonationScreen({ navigation, route }: Props) {
  const { request_id = '1' } = route?.params ?? {};
  const [done, setDone] = useState<string[]>([]);

  const toggle = (id: string) =>
    setDone(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const allDone = STEPS.every(s => done.includes(s.id));

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <RSAppHeader accent={RS.accent} name="Donation checklist" sub="Apollo Hospital · O+ · 1 unit" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, gap: 16 }}>
        <RSCard style={{ gap: 0 }}>
          {STEPS.map((step, i) => {
            const checked = done.includes(step.id);
            return (
              <TouchableOpacity key={step.id} onPress={() => toggle(step.id)} activeOpacity={0.7}>
                <View style={[s.step, i < STEPS.length - 1 && { borderBottomWidth: 1, borderBottomColor: RS.line }]}>
                  <View style={[s.check, { backgroundColor: checked ? RS.teal : RS.fog, borderWidth: checked ? 0 : 1.5, borderColor: RS.line }]}>
                    {checked && <Text style={{ color: RS.white, fontSize: 12, fontWeight: '700' }}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.stepLabel, { color: checked ? RS.teal : RS.ink, textDecorationLine: checked ? 'line-through' : 'none' }]}>{step.label}</Text>
                    <Text style={s.stepSub}>{step.sub}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </RSCard>
        <RSCard style={{ backgroundColor: RS.samber, borderColor: RS.amber, borderWidth: 1.5, gap: 10 }}>
          <Text style={{ fontSize: 12.5, fontWeight: '700', color: RS.amber }}>Your QR Unit Tag</Text>
          <View style={s.qr}>
            <Text style={{ fontFamily: MONO, fontSize: 11, color: RS.ink, letterSpacing: 0.5, textAlign: 'center' }}>
              {'██ █ ██ ██ █ ██\n█              █\n█  ▄▄ ▄▄ ▄▄  █\n█  ▄▄ ▄▄ ▄▄  █\n█              █\n██ █ ██ ██ █ ██'}
            </Text>
            <Text style={{ fontFamily: MONO, fontSize: 10, color: RS.mid, marginTop: 8 }}>VTL-{request_id}-O+-1U</Text>
          </View>
          <Text style={{ fontSize: 11, color: RS.amber, lineHeight: 16 }}>Show this tag to hospital staff for the unit to be logged against your ABHA ID.</Text>
        </RSCard>
        <Text style={s.hint}>You can donate again after 90 days (whole blood). Platelets every 7 days.</Text>
      </ScrollView>
      <View style={{ padding: 18, paddingBottom: 24, backgroundColor: RS.white, borderTopWidth: 1, borderTopColor: RS.line }}>
        <RSBtn onPress={() => navigation.replace('Complete', { request_id })} accent={RS.accent} big disabled={!allDone}>
          Confirm donation complete
        </RSBtn>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 14 },
  check: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  stepLabel: { fontSize: 13.5, fontWeight: '600' },
  stepSub: { fontSize: 11.5, color: RS.mid, marginTop: 3, lineHeight: 16 },
  qr: { backgroundColor: RS.white, borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: RS.line },
  hint: { fontSize: 11, color: RS.faint, lineHeight: 17, textAlign: 'center' },
});
