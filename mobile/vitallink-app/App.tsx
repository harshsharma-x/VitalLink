import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { Platform, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RS } from './src/theme/RS';

import RoleSelectScreen from './src/screens/auth/RoleSelectScreen';
import LoginScreen from './src/screens/auth/LoginScreen';

// Donor screens
import DonorHomeScreen from './src/screens/donor/HomeScreen';
import EmergencyAlertScreen from './src/screens/donor/EmergencyAlertScreen';
import NavigationScreen from './src/screens/donor/NavigationScreen';
import DonationScreen from './src/screens/donor/DonationScreen';
import CompleteScreen from './src/screens/donor/CompleteScreen';
import DonorHistoryScreen from './src/screens/donor/HistoryScreen';

// Patient screens
import PatientHomeScreen from './src/screens/patient/HomeScreen';
import CreateRequestScreen from './src/screens/patient/CreateRequestScreen';
import SearchingScreen from './src/screens/patient/SearchingScreen';
import TrackingScreen from './src/screens/patient/TrackingScreen';
import PatientHistoryScreen from './src/screens/patient/HistoryScreen';
import BloodBanksScreen from './src/screens/patient/BloodBanksScreen';

// Combined
import ProfileScreen from './src/screens/ProfileScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createNativeStackNavigator();

function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: RS.fog, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={RS.accent} />
    </View>
  );
}

function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const role = await AsyncStorage.getItem('user_role');
        if (token && role === 'donor') setInitialRoute('DonorHome');
        else if (token && role === 'patient') setInitialRoute('PatientHome');
        else setInitialRoute('RoleSelect');
      } catch {
        setInitialRoute('RoleSelect');
      }
    })();
  }, []);

  // Notifications listener
  const navigationRef = useRef<any>(null);
  const notifListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('emergency', {
        name: 'Emergency Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C0152A',
        sound: 'default',
      });
    }

    const handleData = (data: any) => {
      if (!navigationRef.current) return;
      if (data?.type === 'emergency_alert') {
        navigationRef.current.navigate('EmergencyAlert', { alertData: data });
      }
      if (data?.type === 'donor_accepted') {
        navigationRef.current.navigate('Tracking', {
          blood_group: data.blood_group,
          request_id: data.request_id,
          match_id: data.match_id,
          donor_name: data.donor_name,
          donor_group: data.donor_blood_group,
          reliability_score: data.reliability_score ?? 0,
          donation_count: data.donation_count ?? 0,
        });
      }
    };

    notifListener.current = Notifications.addNotificationReceivedListener(n => {
      handleData(n.request.content.data);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(r => {
      handleData(r.notification.request.content.data);
    });

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  if (!initialRoute) return <Splash />;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        {/* Auth */}
        <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Donor screens */}
        <Stack.Screen name="DonorHome" component={DonorHomeScreen} />
        <Stack.Screen name="EmergencyAlert" component={EmergencyAlertScreen as any} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Navigation" component={NavigationScreen as any} />
        <Stack.Screen name="Donation" component={DonationScreen as any} />
        <Stack.Screen name="Complete" component={CompleteScreen as any} />
        <Stack.Screen name="DonorHistory" component={DonorHistoryScreen} />

        {/* Patient screens */}
        <Stack.Screen name="PatientHome" component={PatientHomeScreen} />
        <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
        <Stack.Screen name="Searching" component={SearchingScreen as any} options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="Tracking" component={TrackingScreen as any} />
        <Stack.Screen name="PatientHistory" component={PatientHistoryScreen} />
        <Stack.Screen name="BloodBanks" component={BloodBanksScreen} />

        {/* Shared */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return <AppNavigator />;
}
