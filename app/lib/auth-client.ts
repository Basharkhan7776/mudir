import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const getApiUrl = () => {
  const extra = Constants.expoConfig?.extra || {};
  return (
    process.env.EXPO_PUBLIC_SERVER_URL ||
    extra.EXPO_PUBLIC_SERVER_URL ||
    'http://localhost:3001'
  );
};

export const authClient = createAuthClient({
  baseURL: getApiUrl(),
  plugins: [
    expoClient({
      scheme: 'mudir',
      storagePrefix: 'mudir',
      storage: SecureStore,
    }),
  ],
});
