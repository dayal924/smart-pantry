import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BoxOverlay } from '../components/BoxOverlay';
import { ClassPicker } from '../components/ClassPicker';
import { Btn, Card, Chip, EmptyState, Muted, Screen, ScreenHeader, Stepper } from '../components/ui';
import { Storage, getCatalogItem } from '../domain/catalog';
import type { Detection } from '../ml/types';
import { syncNow } from '../services/sync';
import { usePantry } from '../store/pantryStore';
import { useScan } from '../store/scanStore';
import { C, R } from '../theme';

/** Scan verification HUD: inspect boxes, tap to correct class / remove, adjust counts + storage, batch-confirm to pantry. */
export default function Review() {
  const router = useRouter();
  const result = useScan((s) => s.result);
  const [dets, setDets] = useState<Detection[]>(result?.detections ?? []);
  const [sel, setSel] = useState<string | null>(null);
  const [picker, setPicker] = useState<'fix' | 'add' | null>(null);
  const [storage, setStorage] = useState<Record<string, Storage>>({});
  const [extra, setExtra] = useState<Record<string, number>>({});

  const groups = useMemo(() => {
    const m = new Map<string, { key: string; count: number; best: number }>();
    for (const d of dets) {
      if (!d.removed) {
        const g = m.get(d.classKey) ?? { key: d.classKey, count: 0, best: 0 };
        g.count++;
        g.best = Math.max(g.best, d.score);
        m.set(d.classKey, g);
      }
    }
    for (const k of Object.keys(extra)) {
      if (!m.has(k)) m.set(k, { key: k, count: 0, best: 1 });
    }
    return [...m.values()]
      .map((g) => ({ ...g, qty: Math.max(0, g.count + (extra[g.key] ?? 0)) }))
      .sort((a, b) => b.qty - a.qty);
  }, [dets, extra]);

  if (!result) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']}>
        <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
          <EmptyState
            emoji="📷"
            title="No scan found"
            subtitle="Take a photo of your groceries to review detections."
            actionTitle="Go to scanner"
            onAction={() => router.replace('/(tabs)/scan')}
          />
        </View>
      </Screen>
    );
  }

  const selected = dets.find((d) => d.id === sel) ?? null;
  const total = groups.reduce((a, g) => a + g.qty, 0);

  const reclass = (d: Detection, key: string) => {
    const c = getCatalogItem(key);
    setDets((ds) =>
      ds.map((x) =>
        x.id === d.id
          ? {
              ...x,
              classKey: c.key,
              label: c.display,
              emoji: c.emoji,
              correctedFrom: x.correctedFrom ?? x.classKey,
              score: Math.max(x.score, 0.5),
            }
          : x
      )
    );
  };

  const confirm = () => {
    const entries = groups
      .filter((g) => g.qty > 0)
      .map((g) => ({
        classKey: g.key,
        quantity: g.qty,
        storage: storage[g.key],
        scanId: result.scanId,
        source: 'scan' as const,
      }));
    usePantry.getState().addEntries(entries);

    const byKey = new Map<string, any>();
    for (const d of dets) {
      if (!d.removed) {
        const k = `${d.classKey}|${d.correctedFrom ?? ''}`;
        const e = byKey.get(k) ?? {
          class_key: d.classKey,
          quantity: 0,
          confidence: 0,
          corrected_from: d.correctedFrom ?? null,
        };
        e.quantity++;
        e.confidence = Math.max(e.confidence, d.score);
        byKey.set(k, e);
      }
    }

    usePantry.getState().queueScanLog({
      clientScanId: result.scanId,
      payload: {
        client_scan_id: result.scanId,
        source: result.source,
        detector_version: result.detectorVersion,
        latency_ms: result.latencyMs,
        timings: result.timings,
        num_detections: result.detections.length,
        items: [...byKey.values()],
        platform: Platform.OS,
        created_at: new Date().toISOString(),
      },
    });

    const historyItems = groups
      .filter((g) => g.qty > 0)
      .map((g) => {
        const cat = getCatalogItem(g.key);
        return {
          classKey: g.key,
          name: cat.display,
          emoji: cat.emoji,
          quantity: g.qty,
          storage: storage[g.key] ?? cat.default_storage,
          confidence: g.best,
        };
      });

    usePantry.getState().addScanRecord({
      id: result.scanId,
      createdAt: Date.now(),
      detectorVersion: result.detectorVersion,
      latencyMs: result.latencyMs,
      timings: result.timings,
      numDetections: result.detections.length,
      items: historyItems,
    });

    useScan.getState().setResult(null);
    syncNow();
    router.replace('/(tabs)/pantry');
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader
        title="Review & Storage"
        subtitle="Verify items & check optimal storage"
        onBack={() => {
          useScan.getState().setResult(null);
          router.back();
        }}
        rightAction={
          <Btn
            kind="ghost"
            title="Retake"
            onPress={() => {
              useScan.getState().setResult(null);
              router.back();
            }}
            style={{ paddingVertical: 6, paddingHorizontal: 12, minHeight: 36 }}
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BoxOverlay
          uri={result.imageUri}
          imageW={result.imageW}
          imageH={result.imageH}
          detections={dets}
          selectedId={sel}
          onSelect={setSel}
        />

        <View style={styles.statsCard}>
          <Text style={styles.statsText}>
            ⚡ {result.detections.length} items detected on-device · {Math.round(result.latencyMs)} ms
            {result.timings.inference != null ? ` (model ${result.timings.inference} ms)` : ''}
          </Text>
        </View>

        {/* "Where to Put This" Guidance Banner */}
        <Card style={styles.guidanceCard}>
          <View style={styles.guidanceTitleRow}>
            <Ionicons name="sparkles" size={17} color={C.primaryDark} />
            <Text style={styles.guidanceTitle}>"Where to Put This" - Smart Storage</Text>
          </View>
          <Text style={styles.guidanceDesc}>
            Our system automatically recommends whether produce belongs in the Fridge or at Room Temperature based on USDA food guidelines to maximize shelf life.
          </Text>
        </Card>

        {selected ? (
          <Card style={[styles.selectedCard, { borderColor: '#1565C0' }]}>
            <View style={styles.selectedTitleRow}>
              <Text style={styles.selectedTitle}>
                {selected.emoji} {selected.label}
              </Text>
              <View style={styles.confBadge}>
                <Text style={styles.confBadgeText}>
                  {Math.round(selected.score * 100)}% confidence
                </Text>
              </View>
            </View>

            {selected.score < 0.5 && (
              <View style={styles.lowConfNotice}>
                <Text style={{ color: C.warn, fontSize: 13, fontWeight: '700' }}>
                  ⚠️ Low confidence - please verify this item
                </Text>
              </View>
            )}

            <Muted>Tap correct item if misclassified:</Muted>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {selected.alternatives.map((a) => (
                <Chip
                  key={a.classKey}
                  label={`${a.label} ${Math.round(a.score * 100)}%`}
                  onPress={() => reclass(selected, a.classKey)}
                />
              ))}
              <Chip label="Other produce…" onPress={() => setPicker('fix')} />
            </View>

            <Btn
              kind="danger"
              title="Remove item from scan"
              onPress={() => {
                setDets((ds) =>
                  ds.map((x) => (x.id === selected.id ? { ...x, removed: true } : x))
                );
                setSel(null);
              }}
              style={{ minHeight: 38, paddingVertical: 8 }}
            />
          </Card>
        ) : (
          <View style={styles.hintBox}>
            <Muted style={{ textAlign: 'center' }}>
              💡 Tap any box above to edit name or remove. Adjust storage location below.
            </Muted>
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Adding to Pantry ({total})</Text>
          <Btn
            kind="soft"
            title="+ Add item"
            onPress={() => setPicker('add')}
            style={{ minHeight: 34, paddingVertical: 6, paddingHorizontal: 10 }}
          />
        </View>

        {groups.length === 0 && (
          <Card>
            <Muted style={{ textAlign: 'center' }}>
              No produce detected. Retake in better lighting or tap '+ Add item' above.
            </Muted>
          </Card>
        )}

        {groups.map((g) => {
          const c = getCatalogItem(g.key);
          const st = storage[g.key] ?? c.default_storage;
          const isFridgeRec = c.default_storage === 'fridge';
          return (
            <Card key={g.key} style={styles.groupCard}>
              <View style={styles.groupRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  <Text style={{ fontSize: 28 }}>{c.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.groupName}>{c.display}</Text>
                    <View style={styles.recBadge}>
                      <Text style={styles.recBadgeText}>
                        ✨ Recommended: {isFridgeRec ? '❄️ Refrigerator' : '🏠 Room Temp'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Stepper
                  value={g.qty}
                  min={0}
                  max={99}
                  step={1}
                  onChange={(v) => setExtra((e) => ({ ...e, [g.key]: v - g.count }))}
                />
              </View>

              <View style={styles.storageToggleRow}>
                <Text style={{ fontSize: 13, color: C.muted, fontWeight: '700' }}>Storage:</Text>
                <Chip
                  label={`🏠 Room (${c.shelf_life_days.room}d)${!isFridgeRec ? ' ⭐' : ''}`}
                  active={st === 'room'}
                  onPress={() => setStorage((s) => ({ ...s, [g.key]: 'room' }))}
                />
                <Chip
                  label={`❄️ Fridge (${c.shelf_life_days.fridge}d)${isFridgeRec ? ' ⭐' : ''}`}
                  active={st === 'fridge'}
                  onPress={() => setStorage((s) => ({ ...s, [g.key]: 'fridge' }))}
                />
              </View>

              {c.tip ? (
                <View style={styles.tipBox}>
                  <Ionicons name="information-circle-outline" size={15} color={C.primaryDark} />
                  <Text style={styles.tipText}>{c.tip}</Text>
                </View>
              ) : null}
            </Card>
          );
        })}

        <Btn
          title={`Confirm & Add ${total} Item${total === 1 ? '' : 's'}`}
          onPress={confirm}
          disabled={total === 0}
          style={{ marginTop: 8 }}
        />
      </ScrollView>

      <ClassPicker
        visible={picker !== null}
        title={picker === 'fix' ? 'Correct this item' : 'Add item to pantry'}
        onClose={() => setPicker(null)}
        onPick={(k) => {
          if (picker === 'fix' && selected) reclass(selected, k);
          else setExtra((e) => ({ ...e, [k]: (e[k] ?? 0) + 1 }));
          setPicker(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 40,
    gap: 12,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: R.md,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: C.textSecondary,
    fontWeight: '600',
  },
  guidanceCard: {
    backgroundColor: '#F1F8E9',
    borderColor: '#C8E6C9',
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  guidanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guidanceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: C.primaryDark,
  },
  guidanceDesc: {
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 17,
  },
  selectedCard: {
    gap: 10,
    borderWidth: 1.5,
  },
  selectedTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
  },
  confBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.full,
  },
  confBadgeText: {
    color: '#1565C0',
    fontSize: 11,
    fontWeight: '700',
  },
  lowConfNotice: {
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: R.sm,
  },
  hintBox: {
    paddingVertical: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
  },
  groupCard: {
    gap: 10,
    padding: 14,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  recBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: R.sm,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  recBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B5E20',
  },
  storageToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: R.sm,
    marginTop: 2,
  },
  tipText: {
    fontSize: 12,
    color: C.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});
