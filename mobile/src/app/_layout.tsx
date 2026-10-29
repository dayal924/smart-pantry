import NetInfo from '@react-native-community/netinfo';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { initGlobalCrashHandler } from '../services/crashLogger';
import { isOnline } from '../services/network';
import { registerForBroadcasts, scheduleExpiryAlerts } from '../services/notifications';
import { refreshRecipes, syncNow } from '../services/sync';
import { useAuth } from '../store/authStore';
import { useModel } from '../store/modelStore';
import { usePantry } from '../store/pantryStore';
import { useSettings } from '../store/settingsStore';
import { C } from '../theme';

// Initialize global crash interceptor as early as possible
initGlobalCrashHandler();

export default function RootLayout() {
  const { user, hydrated, hydrate } = useAuth();
  const items = usePantry((s) => s.items);
  const notify = useSettings((s) => s.notify);

  useEffect(() => {
    hydrate();
    useModel.getState().load(useSettings.getState().accel);
  }, []);

  // after login: sync, refresh recipes, push token, silent OTA model check
  useEffect(() => {
    if (!user) return;
    syncNow();
    refreshRecipes();
    registerForBroadcasts();
    const t = setTimeout(async () => {
      if (useSettings.getState().autoModelUpdate && (await isOnline())) {
        useModel.getState().update();
      }
    }, 6000);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') syncNow();
    });
    const net = NetInfo.addEventListener((s) => {
      if (s.isConnected) syncNow();
    });
    return () => {
      clearTimeout(t);
      sub.remove();
      net();
    };
  }, [user?.id]);

  // keep local expiry alerts + background sync in step with pantry changes (debounced)
  useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => {
      scheduleExpiryAlerts(items, notify);
    }, 1500);
    const s = setTimeout(() => {
      syncNow();
    }, 2500);
    return () => {
      clearTimeout(t);
      clearTimeout(s);
    };
  }, [items, notify, user?.id]);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="dark" />
        {!hydrated ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: C.bg,
            }}
          >
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: C.bg },
              animation: 'default',
            }}
          >
            <Stack.Protected guard={!!user}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="review"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen name="nutrition" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="scans" />
            </Stack.Protected>
            <Stack.Protected guard={!user}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
          </Stack>
        )}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
