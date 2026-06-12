import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthCallback() {
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      console.log('[Auth Callback] Params:', JSON.stringify(params));

      if (params.token) {
        // Decode the URL-encoded token and save it
        const token = decodeURIComponent(params.token as string);
        console.log('[Auth Callback] Token received, saving...');
        await AsyncStorage.setItem('auth_token', token);
      } else {
        console.log('[Auth Callback] No token in params');
      }

      // Navigate back to home — onAuthChange will pick up the new session
      router.replace('/');
    };

    handleAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>Completing login...</Text>
    </View>
  );
}
