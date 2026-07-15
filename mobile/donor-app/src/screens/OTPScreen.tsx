import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RS, MONO } from '../theme/RS';
import Drop from '../components/Drop';
import RSBtn from '../components/RSBtn';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: { params: { phone: string; name: string; role: string; blood_group: string; dev_otp?: string } };
};

const RESEND_SECONDS = 60;

export default function OTPScreen({ navigation, route }: Props) {
  const { phone, name, blood_group, dev_otp } = route.params;
  const [otp, setOtp] = useState(dev_otp ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [devOtp, setDevOtp] = useState(dev_otp);
  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setCountdown(RESEND_SECONDS);
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(s => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    setTimeout(() => inputRef.current?.focus(), 200);
    return () => { timerRef.current && clearInterval(timerRef.current); };
  }, []);

  const maskedPhone = `+91 ${phone.slice(0, 5)} ${phone.slice(5, 7)}****`;

  const handleVerify = async () => {
    if (otp.length !== 6) { setError('Enter the full 6-digit code'); return; }
    setError('');
    setLoading(true);
    try {
      const { BASE_URL } = await import('../config');
      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name, role: 'donor', blood_group }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? 'Verification failed');

      await Promise.all([
        AsyncStorage.setItem('access_token', data.token),
        AsyncStorage.setItem('donor_id', String(data.donor_id ?? data.user_id)),
        AsyncStorage.setItem('donor_name', name),
        AsyncStorage.setItem('donor_phone', phone),
        AsyncStorage.setItem('donor_group', blood_group),
      ]);
      navigation.replace('Home');
    } catch (e: any) {
      setError(e.message ?? 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setOtp('');
    setDevOtp(undefined);
    try {
      const { BASE_URL } = await import('../config');
      const res = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.dev_otp) { setDevOtp(data.dev_otp); setOtp(data.dev_otp); }
    } catch {}
    startTimer();
  };

  const mins = Math.floor(countdown / 60).toString().padStart(2, '0');
  const secs = (countdown % 60).toString().padStart(2, '0');

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: RS.fog }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          <Drop size={16} color={RS.accent} />
          <Text style={s.brand}>VitalLink</Text>
        </View>

        <View style={s.progress}>
          {[0, 1].map(i => <View key={i} style={[s.dot, { backgroundColor: RS.accent }]} />)}
        </View>

        <View style={{ flex: 1, paddingTop: 26, gap: 20 }}>
          <View>
            <Text style={s.heading}>Enter the{'\n'}OTP.</Text>
            <Text style={s.sub}>We sent a 6-digit code to {maskedPhone}</Text>
          </View>

          {/* Hidden native input */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={t => { setOtp(t.replace(/\D/g, '').slice(0, 6)); setError(''); }}
            keyboardType="number-pad"
            maxLength={6}
            style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
          />

          {/* 6 digit boxes */}
          <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()} style={s.digitRow}>
            {Array.from({ length: 6 }).map((_, i) => {
              const active = otp.length === i;
              const filled = i < otp.length;
              return (
                <View key={i} style={[
                  s.digitBox,
                  filled && { borderColor: RS.teal, backgroundColor: RS.steal },
                  active && { borderColor: RS.accent },
                ]}>
                  {filled ? (
                    <Text style={s.digitText}>{otp[i]}</Text>
                  ) : active ? (
                    <View style={s.cursor} />
                  ) : null}
                </View>
              );
            })}
          </TouchableOpacity>

          {error ? <Text style={s.error}>{error}</Text> : null}

          {devOtp ? (
            <View style={{ backgroundColor: RS.samber, borderRadius: 10, padding: 12 }}>
              <Text style={{ fontSize: 11, color: RS.amber, fontWeight: '700', letterSpacing: 0.3 }}>
                DEV MODE — no SMS configured. OTP auto-filled: {devOtp}
              </Text>
            </View>
          ) : null}

          {countdown > 0 ? (
            <Text style={s.timer}>
              Resend available in{' '}
              <Text style={{ fontFamily: MONO, fontWeight: '700', color: RS.ink }}>{mins}:{secs}</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={s.resendLink}>
                Didn't receive it?{' '}
                <Text style={{ color: RS.accent, fontWeight: '700' }}>Resend OTP</Text>
              </Text>
            </TouchableOpacity>
          )}

          <RSBtn onPress={handleVerify} accent={RS.accent} big loading={loading} disabled={otp.length !== 6} style={{ marginTop: 4 }}>
            Verify & register
          </RSBtn>

          <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 12.5, color: RS.mid }}>← Change number</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, padding: 22, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brand: { fontSize: 15, fontWeight: '800', color: RS.ink, letterSpacing: -0.2 },
  progress: { flexDirection: 'row', gap: 5, marginTop: 14 },
  dot: { height: 4, borderRadius: 2, flex: 1 },
  heading: { fontSize: 30, fontWeight: '800', color: RS.ink, letterSpacing: -0.5, lineHeight: 36, marginBottom: 10 },
  sub: { fontSize: 13, color: RS.mid, lineHeight: 20 },
  digitRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  digitBox: {
    flex: 1, height: 56, maxWidth: 52, borderRadius: 12,
    borderWidth: 1.5, borderColor: RS.line, backgroundColor: RS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  digitText: { fontFamily: MONO, fontWeight: '700', fontSize: 22, color: RS.ink },
  cursor: { width: 2, height: 22, backgroundColor: RS.accent, borderRadius: 1 },
  error: { fontSize: 12.5, color: RS.accent, fontWeight: '600', textAlign: 'center' },
  timer: { fontSize: 12, color: RS.mid, textAlign: 'center' },
  resendLink: { fontSize: 12, color: RS.mid, textAlign: 'center' },
});
