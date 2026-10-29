import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Bar, Btn, Card, Muted, Screen, ScreenHeader } from '../../components/ui';
import { api } from '../../services/api';
import { syncNow } from '../../services/sync';
import { useAuth } from '../../store/authStore';
import { useModel } from '../../store/modelStore';
import { usePantry } from '../../store/pantryStore';
import { C, R } from '../../theme';

export default function Profile() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const model = useModel();
  const { dirtyItems, lastSync } = usePantry();
  const [news, setNews] = useState<{ title: string; body: string }[]>([]);
  const [fb, setFb] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.announcements().then(setNews).catch(() => {});
  }, []);

  const sync = async () => {
    setBusy(true);
    const r = await syncNow();
    setBusy(false);
    Alert.alert(
      r.ok ? 'Synced' : 'Not synced',
      r.ok
        ? `Sent ${r.pushed}, received ${r.pulled}.`
        : r.error === 'offline'
        ? 'You are offline - changes are saved locally and will sync once connected.'
        : r.error
    );
  };

  const upd = async () => Alert.alert('Model status', await model.update());

  const send = async () => {
    try {
      await api.feedback({ kind: 'app', message: fb });
      setFb('');
      Alert.alert('Thanks!', 'Your feedback was sent to the Smart Pantry team.');
    } catch (e: any) {
      Alert.alert('Could not send', e.message);
    }
  };

  const logout = () =>
    Alert.alert('Sign out?', 'Unsynced changes on this phone will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          usePantry.getState().reset();
          await useAuth.getState().logout();
        },
      },
    ]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SP';

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScreenHeader title="Profile" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.userName}>{user?.name}</Text>
              {user?.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>
            <Muted>{user?.email}</Muted>
          </View>
        </Card>

        {/* On-device model card */}
        <Card style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="hardware-chip-outline" size={20} color={C.primary} />
            <Text style={styles.cardSectionTitle}>On-Device Model</Text>
          </View>
          <Muted>
            {model.info
              ? `${model.info.version} (${model.info.source}) · ${model.info.numClasses} classes · ${model.info.provider} · warm-up ${model.info.warmupMs} ms`
              : model.status === 'error'
              ? model.error
              : 'Loading model details…'}
          </Muted>
          {model.progress != null && (
            <View style={{ gap: 4, marginTop: 4 }}>
              <Bar pct={model.progress * 100} />
              <Muted>Downloading: {Math.round(model.progress * 100)}%</Muted>
            </View>
          )}
          <Btn
            kind="soft"
            title={
              model.progress != null
                ? `Downloading ${Math.round(model.progress * 100)}%`
                : 'Check for model update'
            }
            onPress={upd}
            disabled={model.progress != null}
            style={{ marginTop: 4 }}
          />
        </Card>

        {/* Sync card */}
        <Card style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="sync-outline" size={20} color={C.primary} />
            <Text style={styles.cardSectionTitle}>Pantry Sync</Text>
          </View>
          <Muted>
            {dirtyItems.length} changes pending · Last sync{' '}
            {lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never'}
          </Muted>
          <Btn kind="soft" title="Sync now" onPress={sync} loading={busy} style={{ marginTop: 4 }} />
        </Card>

        {/* Nav links */}
        <View style={styles.navGroup}>
          <Pressable
            onPress={() => router.push('/nutrition')}
            style={({ pressed }) => [
              styles.navRow,
              pressed && { backgroundColor: C.borderLight },
            ]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.navIconBox, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="nutrition-outline" size={20} color={C.primary} />
              </View>
              <Text style={styles.navRowText}>Nutrition Tracker</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </Pressable>

          <View style={styles.navDivider} />

          <Pressable
            onPress={() => router.push('/scans')}
            style={({ pressed }) => [
              styles.navRow,
              pressed && { backgroundColor: C.borderLight },
            ]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.navIconBox, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="time-outline" size={20} color="#1976D2" />
              </View>
              <Text style={styles.navRowText}>Scan History</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </Pressable>

          <View style={styles.navDivider} />

          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [
              styles.navRow,
              pressed && { backgroundColor: C.borderLight },
            ]}
          >
            <View style={styles.navRowLeft}>
              <View style={[styles.navIconBox, { backgroundColor: '#EDE7F6' }]}>
                <Ionicons name="settings-outline" size={20} color="#5E35B1" />
              </View>
              <Text style={styles.navRowText}>Settings & AI Tuning</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </Pressable>
        </View>

        {/* Announcements */}
        {news.length > 0 && (
          <Card style={styles.cardSection}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="megaphone-outline" size={20} color={C.warn} />
              <Text style={styles.cardSectionTitle}>Announcements</Text>
            </View>
            {news.slice(0, 3).map((n, i) => (
              <View key={i} style={styles.announcementItem}>
                <Text style={styles.announcementTitle}>{n.title}</Text>
                <Muted>{n.body}</Muted>
              </View>
            ))}
          </Card>
        )}

        {/* Feedback card */}
        <Card style={styles.cardSection}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="chatbubble-outline" size={20} color={C.info} />
            <Text style={styles.cardSectionTitle}>Send Feedback</Text>
          </View>
          <TextInput
            value={fb}
            onChangeText={setFb}
            multiline
            placeholder="What worked well, what produce was misclassified?"
            placeholderTextColor="#9AA597"
            style={styles.feedbackInput}
          />
          <Btn kind="soft" title="Send feedback" onPress={send} disabled={!fb.trim()} />
        </Card>

        {/* Sign out */}
        <Btn kind="danger" title="Sign out" onPress={logout} icon="log-out-outline" style={{ marginTop: 8 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 40,
    gap: 14,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  adminBadge: {
    backgroundColor: C.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: R.xs,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: C.primaryDark,
  },
  cardSection: {
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },
  navGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRowText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  navDivider: {
    height: 1,
    backgroundColor: C.borderLight,
    marginLeft: 62,
  },
  announcementItem: {
    gap: 2,
    paddingTop: 4,
  },
  announcementTitle: {
    fontWeight: '700',
    color: C.text,
    fontSize: 14,
  },
  feedbackInput: {
    minHeight: 70,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    padding: 12,
    fontSize: 14,
    color: C.text,
    backgroundColor: '#FAFBF9',
    textAlignVertical: 'top',
  },
});
