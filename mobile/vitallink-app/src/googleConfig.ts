/**
 * Google OAuth Configuration
 *
 * Client IDs are read from app.json → extra → googleClientId.
 * To set up real Google Sign-In:
 *   1. Go to https://console.cloud.google.com → APIs & Services → Credentials
 *   2. Create OAuth 2.0 Client IDs:
 *      - Web application (required for Expo Go + web)
 *      - Android (package: com.vitallink.app)
 *      - iOS (bundle ID: com.vitallink.app)
 *   3. For Android, you need the SHA-1 of your signing key.
 *      Development: use the SHA-1 from `npx expo credentials:manager`
 *      Production: use the Google Play Console app signing SHA-1
 *   4. Update the values below in app.json
 *
 * Redirect URI (add this to your Web client ID in Google Cloud Console):
 *   https://auth.expo.io/@harshsharmax/vitallink
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

/**
 * Returns the appropriate Google Client ID for the current platform.
 * - Web / Expo Go → webClientId
 * - iOS native   → iosClientId
 * - Android native → androidClientId
 */
export function getGoogleClientId(): string {
  if (Platform.OS === 'ios') return ids.ios;
  if (Platform.OS === 'android') return ids.android;
  return ids.web; // web / default
}

/**
 * Full config object for Google.useIdTokenAuthRequest()
 */
export const googleAuthConfig = {
  clientId: ids.web,
  iosClientId: ids.ios,
  androidClientId: ids.android,
  selectAccount: true,
};

/**
 * Whether real Google credentials are configured (vs placeholders)
 */
export function isGoogleConfigured(): boolean {
  return (
    ids.web !== defaults.web &&
    !ids.web.startsWith('YOUR_')
  );
}

export default ids;
