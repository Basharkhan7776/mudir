import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
} from 'firebase/auth';
import { getFirebaseAuth, environment } from './config';
import Constants from 'expo-constants';

const getEnvVars = () => {
  const extra = Constants.expoConfig?.extra || {};
  return {
    firebaseApiKey: extra.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '',
    firebaseAuthDomain: extra.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || '',
    webClientId: extra.GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_WEB_CLIENT_ID || '',
    iosClientId: extra.GOOGLE_IOS_CLIENT_ID || process.env.GOOGLE_IOS_CLIENT_ID || '',
  };
};

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const configureGoogleSignIn = () => {
  const env = getEnvVars();

  GoogleSignin.configure({
    webClientId: env.webClientId || 'your-web-client-id.apps.googleusercontent.com',
    iosClientId: env.iosClientId || 'your-ios-client-id.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  console.log(`[Auth] Google Sign-In configured for ${environment.name} environment`);
};

export const signInWithGoogle = async (): Promise<AuthUser | null> => {
  try {
    configureGoogleSignIn();

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const response = await GoogleSignin.signIn();

    if (response.data?.idToken) {
      const auth = getFirebaseAuth();
      const credential = GoogleAuthProvider.credential(response.data.idToken);

      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      };
    }

    return null;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('[Auth] User cancelled sign in');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('[Auth] Sign in in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('[Auth] Play services not available');
    } else {
      console.error('[Auth] Sign in error:', error);
    }
    return null;
  }
};

export const signOutGoogle = async (): Promise<boolean> => {
  try {
    const auth = getFirebaseAuth();
    await signOut(auth);
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    console.log('[Auth] Signed out successfully');
    return true;
  } catch (error) {
    console.error('[Auth] Sign out error:', error);
    return false;
  }
};

export const getCurrentUser = (): AuthUser | null => {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;

  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }

  return null;
};

export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
  const auth = getFirebaseAuth();

  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    } else {
      callback(null);
    }
  });
};

export const isUserLoggedIn = (): boolean => {
  const auth = getFirebaseAuth();
  return auth.currentUser !== null;
};
