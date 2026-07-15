import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../../theme/RS';
import BloodTag from '../../components/BloodTag';
import PulseDot from '../../components/PulseDot';
import RouteMap from '../../components/RouteMap';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export default function TrackingScreen({ navigation, route }: Props) {
  const {
    blood_group = 'O+',
    units = 1,
    donor_name = 'Donor',
    donor_group,
    reliability_score = 0,
    donation_count = 0,
  } = route?.params ?? {};

  const [progress, setProgress] = useState(0);
  const [arrived, setArrived] = useState(false);
  const eta = Math.max(0, Math.round(8 * (1 - progress)));
  const dist = (2.3 * (1 - progress)).toFixed(1);

  // Donor initial for avatar
  const initial = donor_name?.trim()?.[0]?.toUpperCase() ?? 'D';
  // Masked name: "Rahul S." → keep as-is; truncate long names
  const displayName = donor_name?.length > 14 ? donor_name.split(' ')[0] + ' ' + (donor_name.split(' ')[1]?.[0] ?? '') + '.' : donor_name;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + 0.015;
        if (next >= 1) { clearInterval(interval); setArrived(true); return 1; }
        return next;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const reliabilityColor = reliability_score >= 80 ? RS.teal : reliability_score >= 50 ? RS.amber : RS.accent;

  return (
    <View style={{ flex: 1, backgroundColor: RS.fog }}>
      <View style={{ flex: 1, position: 'relative' }}>
        <RouteMap progress={progress} accent={RS.accent} arrived={arrived} height={undefined as any} />
        <View style={s.chipWrapper} pointerEvents="none">
          <View style={[s.chip, { backgroundColor: arrived ? RS.teal : RS.ink }]}>
            <PulseDot color={RS.white} size={7} />
            <Text style={s.chipText}>{arrived ? 'Donor has arrived at the hospital' : 'Donor found — on the way'}</Text>
          </View>
        </View>
      </View>

      <View style={s.sheet}>
        <View style={s.sheetHandle} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.donorName}>{displayName}</Text>
            <Text style={s.donorSub}>
              {donation_count} donation{donation_count !== 1 ? 's' : ''} · {reliability_score}% reliability
            </Text>
          </View>
          <BloodTag group={donor_group ?? blood_group} accent={RS.accent} />
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <View style={s.stat}>
            <Text style={s.statLabel}>ETA</Text>
            <Text style={[s.statVal, { color: arrived ? RS.teal : RS.ink }]}>
              {arrived ? 'Arrived' : `${eta} min`}
            </Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statLabel}>Distance</Text>
            <Text style={s.statVal}>{arrived ? '0.0 km' : `${dist} km`}</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statLabel}>Units</Text>
            <Text style={s.statVal}>{units}</Text>
          </View>
        </View>

        {/* Reliability bar */}
        <View style={{ marginTop: 12, gap: 5 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 10.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', color: RS.faint }}>
              Donor reliability
            </Text>
            <Text style={{ fontSize: 10.5, fontWeight: '700', color: reliabilityColor }}>{reliability_score}%</Text>
          </View>
          <View style={{ height: 5, backgroundColor: RS.line, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${reliability_score}%`, backgroundColor: reliabilityColor, borderRadius: 3 }} />
          </View>
        </View>

        <TouchableOpacity
          style={s.callBtn}
          onPress={() => Alert.alert('Calling', 'Number stays masked for privacy — call is routed through VitalLink.')}
          activeOpacity={0.8}
        >
          <Text style={s.callBtnText}>☎  Call donor (number stays masked)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  chipWrapper: { position: 'absolute', top: 12, left: 12, right: 12, alignItems: 'center' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 6,
  },
  chipText: { color: RS.white, fontSize: 12, fontWeight: '600' },
  sheet: {
    backgroundColor: RS.white, borderTopLeftRadius: 18, borderTopRightRadius: 18,
    marginTop: -16, padding: 18, paddingBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 30, elevation: 8,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: RS.line, alignSelf: 'center', marginBottom: 14 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: RS.steal, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: RS.teal, fontWeight: '700', fontSize: 17 },
  donorName: { fontSize: 15.5, fontWeight: '700', color: RS.ink },
  donorSub: { fontSize: 11.5, color: RS.mid, marginTop: 2 },
  stat: { flex: 1, backgroundColor: RS.fog, borderRadius: 12, padding: 12 },
  statLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', color: RS.faint },
  statVal: { fontFamily: MONO, fontWeight: '700', fontSize: 20, color: RS.ink, marginTop: 2 },
  callBtn: { marginTop: 14, borderWidth: 1.5, borderColor: RS.line, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  callBtnText: { color: RS.ink, fontWeight: '600', fontSize: 14 },
});
