/**
 * Google OAuth Configuration
 *
 * Client IDs are read from app.json → extra → googleClientId.
 * To set up real Google Sign-In:
 *   1. Go to https://console.cloud.google.com → APIs & Services → Credentials
 *   2. Create OAuth 2.0 Client IDs: Web, Android (com.vitallink.patient), iOS
 *   3. Update the values in app.json → extra → googleClientId
 *
 * Redirect URI (add to Web client ID in Google Cloud Console):
 *   https://auth.expo.io/@harshsharmax/vitallink-patient
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

interface GoogleClientIds {
  web: string;
  ios: string;
  android: string;
}

const defaults: GoogleClientIds = {
  web: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  ios: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  android: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
};

function getGoogleClientIds(): GoogleClientIds {
  const extra = Constants.expoConfig?.extra as Record<string, any> | undefined;
  const ids = extra?.googleClientId as Partial<GoogleClientIds> | undefined;
  if (!ids) return defaults;
  return {
    web: ids.web || defaults.web,
    ios: ids.ios || defaults.ios,
    android: ids.android || defaults.android,
  };
}

const ids = getGoogleClientIds();

export const googleAuthConfig = {
  clientId: ids.web,
  iosClientId: ids.ios,
  androidClientId: ids.android,
  selectAccount: true,
};

export function isGoogleConfigured(): boolean {
  return ids.web !== defaults.web && !ids.web.startsWith('YOUR_');
}

export default ids;
