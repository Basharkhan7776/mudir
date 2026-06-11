import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthCallback() {
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    console.log('[Auth Callback] Deep link hit with params:', JSON.stringify(params, null, 2));

    const handleAuth = async () => {
      // Check if our server forwarded the session token
      if (params.token) {
        console.log('[Auth Callback] Token found! Saving to AsyncStorage...');
        await AsyncStorage.setItem('auth_token', params.token as string);
      } else {
        console.log('[Auth Callback] No token found in params!');
      }
      
      // Redirect back to home
      console.log('[Auth Callback] Redirecting to home...');
      router.replace('/');
    };

    handleAuth();
  }, [params, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>Completing login...</Text>
    </View>
  );
}
