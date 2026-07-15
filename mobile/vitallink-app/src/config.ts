/**
 * VitalLink — API Configuration
 *
 * The API URL is resolved in this priority order:
 *   1. EAS Build environment variable (EXPO_PUBLIC_API_URL)
 *   2. app.json → extra → apiUrl (set per EAS profile)
 *   3. Local development fallback
 *
 * For local Expo Go testing, update apiUrl in app.json.
 * For EAS builds, set EXPO_PUBLIC_API_URL in eas.json env vars.
 */

import Constants from 'expo-constants';

function resolveApiUrl(): string {
  // 1. EAS / Expo public env var (SDK 49+)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. app.json extra config (settable per EAS profile)
  const extra = Constants.expoConfig?.extra;
  if (extra?.apiUrl) {
    return extra.apiUrl;
  }

  // 3. Fallback — local dev (Expo Go / emulator on same machine)
  return 'http://localhost:8000';
}

const url = resolveApiUrl();
export const BASE_URL = url;
export const SOCKET_URL = url;
