import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getEnvVars = () => {
  const extra = Constants.expoConfig?.extra || {};
  return {
    apiUrl: process.env.EXPO_PUBLIC_SERVER_URL || extra.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000',
  };
};

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

export interface Session {
  user: AuthUser;
  expiresAt: string;
}

export const signInWithGoogle = async (): Promise<AuthUser | null> => {
  try {
    const env = getEnvVars();
    const redirectUrl = Linking.createURL('auth-callback');
    
    const authUrl = `${env.apiUrl}/api/auth/signin/google?redirect_url=${encodeURIComponent(redirectUrl)}`;
    console.log('[Auth] Opening URL:', authUrl);
    
    const result = await Linking.openURL(authUrl);
    console.log('[Auth] Browser returned to app!');

    if (!result) {
      return null;
    }

    return null;
  } catch (error) {
    console.error('[Auth] Sign in error:', error);
    return null;
  }
};

export const signOut = async (): Promise<boolean> => {
  try {
    const env = getEnvVars();
    const token = await AsyncStorage.getItem('auth_token');
    
    await fetch(`${env.apiUrl}/api/auth/signout`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    
    await AsyncStorage.removeItem('auth_token');
    return true;
  } catch (error) {
    console.error('[Auth] Sign out error:', error);
    return false;
  }
};

export const getSession = async (): Promise<Session | null> => {
  try {
    const env = getEnvVars();
    const token = await AsyncStorage.getItem('auth_token');
    
    if (!token) {
      return null;
    }
    
    const response = await fetch(`${env.apiUrl}/api/auth/getSession`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.isAuthenticated) {
      return null;
    }
    
    return {
      user: data.user,
      expiresAt: data.expiresAt,
    };
  } catch (error) {
    console.error('[Auth] Get session error:', error);
    return null;
  }
};

export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
  const checkAuth = async () => {
    const session = await getSession();
    callback(session?.user || null);
  };
  
  checkAuth();
  
  const interval = setInterval(checkAuth, 30000);
  
  return () => clearInterval(interval);
};

export const getAuthToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('auth_token');
};
