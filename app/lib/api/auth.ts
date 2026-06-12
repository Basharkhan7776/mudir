import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getEnvVars = () => {
  const extra = Constants.expoConfig?.extra || {};
  return {
    apiUrl:
      process.env.EXPO_PUBLIC_SERVER_URL || extra.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3001',
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

/**
 * Retrieve and fix the auth token from AsyncStorage.
 * URL parsing can convert '+' to spaces, so we fix that here.
 */
const getFixedToken = async (): Promise<string | null> => {
  const raw = await AsyncStorage.getItem('auth_token');
  if (!raw) return null;
  // URL decoding can turn '+' into spaces; restore them
  return raw.replace(/ /g, '+');
};

/**
 * Opens the browser for Google OAuth sign-in.
 * The actual token is received via deep link in auth-callback.tsx.
 * Returns null immediately — auth state is picked up by onAuthChange.
 */
export const signInWithGoogle = async (): Promise<AuthUser | null> => {
  try {
    const env = getEnvVars();
    const redirectUrl = Linking.createURL('auth-callback');
    const authUrl = `${env.apiUrl}/api/auth/signin/google?redirect_url=${encodeURIComponent(redirectUrl)}`;
    console.log('[Auth] Opening OAuth URL:', authUrl);
    await Linking.openURL(authUrl);
    // Token will be saved by auth-callback.tsx when the deep link fires.
    // We return null here; onAuthChange polling will pick up the session.
    return null;
  } catch (error) {
    console.error('[Auth] Sign in error:', error);
    return null;
  }
};

export const signOut = async (): Promise<boolean> => {
  try {
    const env = getEnvVars();
    const token = await getFixedToken();

    await fetch(`${env.apiUrl}/api/auth/sign-out`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    await AsyncStorage.removeItem('auth_token');
    return true;
  } catch (error) {
    console.error('[Auth] Sign out error:', error);
    await AsyncStorage.removeItem('auth_token');
    return true;
  }
};

export const getSession = async (): Promise<Session | null> => {
  try {
    const env = getEnvVars();
    const token = await getFixedToken();

    if (!token) {
      return null;
    }

    const response = await fetch(`${env.apiUrl}/api/auth/get-session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.log('[Auth] getSession failed:', response.status);
      // Token might be expired/invalid — clear it
      if (response.status === 401) {
        await AsyncStorage.removeItem('auth_token');
      }
      return null;
    }

    const data = await response.json();

    // Better Auth returns { session: {...}, user: {...} }
    if (!data || !data.session) {
      console.log('[Auth] getSession: no session in response');
      return null;
    }

    return {
      user: data.user,
      expiresAt: data.session.expiresAt,
    };
  } catch (error) {
    console.error('[Auth] getSession error:', error);
    return null;
  }
};

export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
  const checkAuth = async () => {
    const session = await getSession();
    callback(session?.user || null);
  };

  // Check immediately
  checkAuth();

  // Poll every 30 seconds
  const interval = setInterval(checkAuth, 30000);

  return () => clearInterval(interval);
};

export const getAuthToken = async (): Promise<string | null> => {
  return getFixedToken();
};
