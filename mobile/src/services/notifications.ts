import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DAY } from '../domain/shelfLife';
import { PantryItem } from '../store/pantryStore';
import { api } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('expiry', { name: 'Expiry alerts', importance: Notifications.AndroidImportance.HIGH });
  }
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

const IOS_LIMIT = 60; // iOS keeps at most 64 pending local notifications -> schedule the soonest 60

/**
 * Local (offline-capable) alerts 48h and 24h before expiry. Rebuilt from scratch on every pantry change.
 */
export async function scheduleExpiryAlerts(items: PantryItem[], enabled: boolean) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled || !(await ensurePermission())) return;
  const now = Date.now();
  const triggers: { at: number; title: string; body: string }[] = [];
  for (const i of items) {
    if (i.status !== 'active' || i.deleted) continue;
    for (const lead of [2, 1]) {
      const at = i.expiresAt - lead * DAY;
      if (at > now + 60_000) {
        triggers.push({ at, title: `${i.emoji} ${i.name} ${lead === 2 ? 'expires in 2 days' : 'expires tomorrow'}`,
          body: lead === 2 ? 'Plan a meal around it - check Recipes for ideas.' : 'Use it today or it may go to waste.' });
      }
    }
  }
  triggers.sort((a, b) => a.at - b.at);
  for (const t of triggers.slice(0, IOS_LIMIT)) {
    await Notifications.scheduleNotificationAsync({
      content: { title: t.title, body: t.body }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(t.at), channelId: 'expiry' } as any,
    });
  }
}

/** Optional: register for admin broadcasts (needs an EAS projectId; silently skipped in plain dev builds). */
export async function registerForBroadcasts() {
  try {
    if (!(await ensurePermission())) return;
    const tok = await Notifications.getExpoPushTokenAsync();
    await api.pushToken(tok.data, Platform.OS);
  } catch { /* no projectId / offline - not critical */ }
}
