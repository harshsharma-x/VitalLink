import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../../theme/RS';
import Drop from '../../components/Drop';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function RoleSelectScreen({ navigation }: Props) {
  return (
    <ScrollView contentContainerStyle={s.container} style={{ backgroundColor: RS.fog }}>
      <View style={s.header}>
        <Drop size={20} color={RS.accent} />
        <Text style={s.brand}>VitalLink</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', gap: 28, paddingTop: 20 }}>
        <View>
          <Text style={s.heading}>
            I am a{'\n'}
            <Text style={{ color: RS.accent }}>blood donor</Text>
            {'\n'}or{'\n'}
            <Text style={{ color: RS.teal }}>someone in need</Text>?
          </Text>
          <Text style={s.sub}>
            Select your role to get started. You can't switch later without creating a new account.
          </Text>
        </View>

        {/* Donor Card */}
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login', { role: 'donor' })}
        >
          <View style={[s.iconWrap, { backgroundColor: RS.soft }]}>
            <Drop size={14} color={RS.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>I want to donate blood</Text>
            <Text style={s.cardSub}>
              Get alerted when someone near you needs your blood group. Track your donations and impact.
            </Text>
          </View>
          <Text style={s.arrow}>→</Text>
        </TouchableOpacity>

        {/* Patient Card */}
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login', { role: 'patient' })}
        >
          <View style={[s.iconWrap, { backgroundColor: RS.steal }]}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: RS.teal }}>🩺</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>I need blood urgently</Text>
            <Text style={s.cardSub}>
              Request blood in under 90 seconds. Find verified donors and track them live to the hospital.
            </Text>
          </View>
          <Text style={s.arrow}>→</Text>
        </TouchableOpacity>

        <Text style={s.hint}>
          Your choice determines what features you see. Donors receive alerts; patients can place requests.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, padding: 22, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 },
  brand: { fontSize: 15, fontWeight: '800', color: RS.ink, letterSpacing: -0.2 },
  heading: { fontSize: 28, fontWeight: '800', color: RS.ink, letterSpacing: -0.5, lineHeight: 34, marginBottom: 10 },
  sub: { fontSize: 13, color: RS.mid, lineHeight: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: RS.white, borderWidth: 1.5, borderColor: RS.line,
    borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: RS.ink, marginBottom: 3 },
  cardSub: { fontSize: 11.5, color: RS.mid, lineHeight: 17 },
  arrow: { fontSize: 18, color: RS.faint, flexShrink: 0 },
  hint: { fontSize: 11, color: RS.faint, lineHeight: 17, textAlign: 'center' },
});
