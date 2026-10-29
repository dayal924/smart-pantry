import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Btn, Card, Chip, Muted, Screen, ScreenHeader, Stepper } from '../components/ui';
import { NUTRIENT_KEYS } from '../domain/catalog';
import { SelfTestResult, runSelfTest } from '../ml/selfTest';
import { useModel } from '../store/modelStore';
import { useSettings } from '../store/settingsStore';
import { C, R } from '../theme';
import { getLastCrash, clearLastCrash, CrashInfo } from '../services/crashLogger';

const STEP: Record<string, number> = {
  kcal: 100,
  carbs_g: 10,
  fiber_g: 2,
  vitamin_c_mg: 10,
  protein_g: 5,
};

const NAME: Record<string, { label: string; unit: string }> = {
  kcal: { label: 'Calories', unit: 'kcal' },
  carbs_g: { label: 'Carbs', unit: 'g' },
  fiber_g: { label: 'Fibre', unit: 'g' },
  vitamin_c_mg: { label: 'Vitamin C', unit: 'mg' },
  protein_g: { label: 'Protein', unit: 'g' },
};

export default function SettingsScreen() {
  const router = useRouter();
  const s = useSettings();
  const model = useModel();
  const [st, setSt] = useState<SelfTestResult | 'running' | string | null>(null);
  const [lastCrash, setLastCrash] = useState<CrashInfo | null>(null);

  useEffect(() => {
    getLastCrash().then(setLastCrash);
  }, []);

  const test = async () => {
    setSt('running');
    try {
      setSt(await runSelfTest());
    } catch (e: any) {
      setSt(`Self-test error: ${e?.message ?? e}`);
    }
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader
        title="Settings"
        subtitle="On-device AI tuning & app preferences"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* On-device architecture notice */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={C.primary} />
            <Text style={styles.sectionTitle}>Privacy & Offline First</Text>
          </View>
          <Muted>
            Produce photos are analysed locally on this phone by the bundled neural network.
            Images are never uploaded. Only your confirmed inventory is synced.
          </Muted>
        </Card>

        {/* Self test */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="flask-outline" size={20} color="#6A1B9A" />
            <Text style={styles.sectionTitle}>Detection Pipeline Self-Test</Text>
          </View>
          <Muted>
            Runs 3 bundled reference photos through this phone's neural pipeline to verify
            model weight parity and bounding box accuracy.
          </Muted>
          <Btn
            kind="soft"
            title={st === 'running' ? 'Running self-test…' : 'Run self-test'}
            onPress={test}
            disabled={st === 'running'}
            loading={st === 'running'}
          />

          {typeof st === 'string' && st !== 'running' && (
            <View style={styles.errorNotice}>
              <Text style={{ color: C.danger, fontWeight: '700' }}>{st}</Text>
            </View>
          )}

          {st && typeof st === 'object' && (
            <View
              style={[
                styles.testResultBox,
                {
                  backgroundColor: st.pass ? '#E8F5E9' : '#FFEBEE',
                  borderColor: st.pass ? C.primary : C.danger,
                },
              ]}
            >
              <Text
                style={[
                  styles.testResultTitle,
                  { color: st.pass ? C.primaryDark : C.danger },
                ]}
              >
                {st.pass ? '✅ PASS' : '❌ FAIL'} - {st.matched}/{st.total} confident boxes reproduced
              </Text>
              <Text style={styles.testResultSub}>
                Mean IoU: {st.meanIou.toFixed(2)} · ≈{st.avgMs} ms per photo ({st.modelMs} ms model,{' '}
                {st.provider})
              </Text>
              {st.lines.map((l, i) => (
                <Text key={i} style={styles.testLine}>
                  {l}
                </Text>
              ))}
            </View>
          )}
        </Card>

        {/* AI tuning */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="options-outline" size={20} color={C.primary} />
            <Text style={styles.sectionTitle}>AI Accuracy Tuning</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Confidence threshold</Text>
              <Muted>Lower discovers more items (higher false positives)</Muted>
            </View>
            <Stepper
              value={s.conf}
              onChange={(v) => s.set({ conf: v })}
              step={0.05}
              min={0.1}
              max={0.9}
              fmt={(v) => v.toFixed(2)}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Overlap threshold (NMS IoU)</Text>
              <Muted>Raise if adjacent items merge into one box</Muted>
            </View>
            <Stepper
              value={s.iou}
              onChange={(v) => s.set({ iou: v })}
              step={0.05}
              min={0.3}
              max={0.8}
              fmt={(v) => v.toFixed(2)}
            />
          </View>

          <View style={styles.divider} />

          <View style={{ gap: 8 }}>
            <Text style={styles.settingLabel}>Hardware acceleration</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip
                label="CPU (Reliable)"
                active={s.accel === 'cpu'}
                onPress={() => {
                  s.set({ accel: 'cpu' });
                  model.load('cpu', true);
                }}
              />
              <Chip
                label="GPU / NPU (Fast)"
                active={s.accel === 'auto'}
                onPress={() => {
                  s.set({ accel: 'auto' });
                  model.load('auto', true);
                }}
              />
            </View>
            <Muted>
              Active: {model.info?.provider ?? '…'} · Warm-up {model.info?.warmupMs ?? '-'} ms
            </Muted>
          </View>
        </Card>

        {/* Preferences */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="notifications-outline" size={20} color={C.primary} />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.settingLabel}>Expiry notifications (48h & 24h)</Text>
              <Muted>Alert before produce in your pantry expires</Muted>
            </View>
            <Switch
              value={s.notify}
              onValueChange={(v) => s.set({ notify: v })}
              trackColor={{ false: '#CFD8DC', true: C.primaryMuted }}
              thumbColor={s.notify ? C.primary : '#FFFFFF'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.settingLabel}>Auto-update AI model</Text>
              <Muted>Download better model weights silently when online</Muted>
            </View>
            <Switch
              value={s.autoModelUpdate}
              onValueChange={(v) => s.set({ autoModelUpdate: v })}
              trackColor={{ false: '#CFD8DC', true: C.primaryMuted }}
              thumbColor={s.autoModelUpdate ? C.primary : '#FFFFFF'}
            />
          </View>
        </Card>

        {/* Daily nutrition targets */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="restaurant-outline" size={20} color={C.primary} />
            <Text style={styles.sectionTitle}>Daily Nutrition Targets</Text>
          </View>

          {NUTRIENT_KEYS.map((k, idx) => {
            const info = NAME[k];
            return (
              <React.Fragment key={k}>
                {idx > 0 && <View style={styles.divider} />}
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>{info.label}</Text>
                    <Muted>{info.unit}</Muted>
                  </View>
                  <Stepper
                    value={s.targets[k]}
                    step={STEP[k]}
                    min={STEP[k]}
                    max={STEP[k] * 60}
                    onChange={(v) =>
                      s.set({ targets: { ...s.targets, [k]: v } })
                    }
                  />
                </View>
              </React.Fragment>
            );
          })}
        </Card>

        {/* System Crash Analyzer */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="bug-outline" size={20} color={C.primary} />
            <Text style={styles.sectionTitle}>System Crash Analyzer</Text>
          </View>
          <Muted>
            Monitors unhandled exceptions, native JSI bridge errors, and model loading state.
          </Muted>

          {lastCrash ? (
            <View style={[styles.testResultBox, { borderColor: '#EF4444', backgroundColor: '#FEF2F2' }]}>
              <Text style={[styles.testResultTitle, { color: '#B91C1C' }]}>
                ⚠️ Recorded Crash ({new Date(lastCrash.timestamp).toLocaleTimeString()})
              </Text>
              <Text style={{ fontSize: 12, color: '#B91C1C', fontWeight: '600' }}>
                {lastCrash.message}
              </Text>
              {lastCrash.stack && (
                <Text style={styles.testLine} numberOfLines={5}>
                  {lastCrash.stack}
                </Text>
              )}
              <Btn
                title="Clear Crash Log"
                kind="soft"
                onPress={async () => {
                  await clearLastCrash();
                  setLastCrash(null);
                }}
              />
            </View>
          ) : (
            <View style={[styles.testResultBox, { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.testResultTitle, { color: '#047857' }]}>
                ✅ All Systems Healthy
              </Text>
              <Text style={styles.testResultSub}>
                No fatal exceptions or JSI bridge crashes recorded.
              </Text>
            </View>
          )}
        </Card>
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
  cardSection: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  divider: {
    height: 1,
    backgroundColor: C.borderLight,
  },
  errorNotice: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: R.sm,
  },
  testResultBox: {
    padding: 12,
    borderRadius: R.md,
    borderWidth: 1,
    gap: 4,
  },
  testResultTitle: {
    fontWeight: '800',
    fontSize: 14,
  },
  testResultSub: {
    fontSize: 12,
    color: C.textSecondary,
    fontWeight: '600',
  },
  testLine: {
    fontSize: 11,
    color: C.muted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
