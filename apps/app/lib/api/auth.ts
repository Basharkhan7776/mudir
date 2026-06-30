import { authClient } from '@/lib/auth-client';

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
 * Opens Google OAuth via in-app browser.
 * The @better-auth/expo plugin handles the entire flow:
 * browser open → Google consent → redirect back → cookie stored in SecureStore
 *
 * callbackURL is a relative path — the expoClient plugin automatically
 * converts it to a deep link using Linking.createURL.
 * On native, signIn.social does NOT navigate automatically;
 * we handle navigation ourselves after it resolves.
 */
export const signInWithGoogle = async (): Promise<AuthUser | null> => {
  try {
    const result = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });

    if (result.error) {
      console.error('[Auth] Sign in error:', result.error);
      return null;
    }

    // After sign-in, fetch the session to get user info
    const session = await getSession();
    return session?.user || null;
  } catch (error) {
    console.error('[Auth] Sign in error:', error);
    return null;
  }
};

export const signOut = async (): Promise<boolean> => {
  try {
    await authClient.signOut();
    return true;
  } catch (error) {
    console.error('[Auth] Sign out error:', error);
    return true;
  }
};

export const getSession = async (): Promise<Session | null> => {
  try {
    const result = await authClient.getSession();

    if (result.error || !result.data) {
      return null;
    }

    return {
      user: {
        id: result.data.user.id,
        email: result.data.user.email,
        name: result.data.user.name,
        image: result.data.user.image,
      },
      expiresAt: result.data.session.expiresAt.toString(),
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

/**
 * Get the auth token for API calls (sync etc.)
 * The expoClient plugin stores cookies in SecureStore.
 * We can use authClient's internal fetch which auto-attaches cookies.
 */
export const getAuthToken = async (): Promise<string | null> => {
  // With the expo plugin, cookies are managed automatically.
  // For sync API calls, we'll use authClient's fetch wrapper.
  const session = await getSession();
  return session ? 'authenticated' : null;
};

/**
 * Make an authenticated fetch call that includes Better Auth cookies.
 * Use this for sync API calls instead of manual Bearer tokens.
 *
 * Note: returns better-fetch shape { data, error } (not native Response).
 * Callers must handle accordingly. We force no-cache to avoid 304s on dynamic sync endpoints.
 */
export const authFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
  const merged = {
    cache: 'no-store' as any,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      ...(options.headers || {}),
    },
    ...options,
  };
  // @ts-ignore - authClient.$fetch is the internal fetch with cookie headers
  return authClient.$fetch(url, merged);
};
