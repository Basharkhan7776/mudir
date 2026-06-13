import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { Platform } from 'react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Provider store={store}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            // Apple-style presentation
            presentation: 'card',
            // Smooth transition timing
            animationDuration: 350,
            // Gesture settings for swipe-to-go-back
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            // Full screen gesture area for natural feel
            fullScreenGestureEnabled: true,
          }}
        />
        <PortalHost />
      </Provider>
    </SafeAreaProvider>
  );
}
