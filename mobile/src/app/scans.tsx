import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Btn, Card, EmptyState, Muted, Screen, ScreenHeader } from '../components/ui';
import { getCatalogItem } from '../domain/catalog';
import { api } from '../services/api';
import { isOnline } from '../services/network';
import { ScanHistoryRecord, usePantry } from '../store/pantryStore';
import { C, R, S } from '../theme';

function formatDate(ts: number | string): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today at ${timeStr}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return `Yesterday at ${timeStr}`;

  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

export default function ScanHistory() {
  const router = useRouter();
  const localHistory = usePantry((s) => s.scanHistory) || [];
  const addScanRecord = usePantry((s) => s.addScanRecord);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sync server history if online
  const loadServerHistory = async () => {
    try {
      if (!(await isOnline())) return;
      const remote = await api.scanHistory();
      if (Array.isArray(remote)) {
        for (const r of remote) {
          const items = (r.items || []).map((it: any) => {
            const cat = getCatalogItem(it.class_key || it.classKey);
            return {
              classKey: cat.key,
              name: cat.display,
              emoji: cat.emoji,
              quantity: it.quantity || 1,
              storage: it.storage || cat.default_storage,
              confidence: it.confidence,
            };
          });

          addScanRecord({
            id: r.client_scan_id || r.id || String(Math.random()),
            createdAt: new Date(r.created_at).getTime() || Date.now(),
            detectorVersion: r.detector_version || 'v1-50ep',
            latencyMs: r.latency_ms || 120,
            timings: r.timings,
            numDetections: r.num_detections || items.length,
            items,
          });
        }
      }
    } catch {
      // Offline or network error - local history is preserved
    }
  };

  useEffect(() => {
    loadServerHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServerHistory();
    setRefreshing(false);
  };

  const sortedScans = useMemo(() => {
    return [...localHistory].sort((a, b) => b.createdAt - a.createdAt);
  }, [localHistory]);

  const stats = useMemo(() => {
    const totalScans = sortedScans.length;
    let totalItems = 0;
    let totalLatency = 0;

    for (const s of sortedScans) {
      totalItems += s.items.reduce((sum, it) => sum + it.quantity, 0);
      totalLatency += s.latencyMs;
    }

    const avgLatency = totalScans > 0 ? Math.round(totalLatency / totalScans) : 0;
    return { totalScans, totalItems, avgLatency };
  }, [sortedScans]);

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader
        title="Scan History"
        subtitle="Produce scans & detection logs"
        onBack={() => router.back()}
      />

      <FlatList
        data={sortedScans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
        ListHeaderComponent={
          sortedScans.length > 0 ? (
            <View style={styles.headerContainer}>
              {/* Quick Summary Banner */}
              <View style={styles.statsCard}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.totalScans}</Text>
                  <Text style={styles.statLabel}>Total Scans</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.totalItems}</Text>
                  <Text style={styles.statLabel}>Items Added</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{stats.avgLatency} ms</Text>
                  <Text style={styles.statLabel}>Avg Speed</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Recent Scans</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={{ paddingTop: 60, paddingHorizontal: 16 }}>
            <EmptyState
              emoji="📷"
              title="No scans logged yet"
              subtitle="Point your camera at fresh produce to automatically detect items and add them to your pantry."
              actionTitle="Open Camera Scanner"
              onAction={() => router.push('/(tabs)/scan')}
            />
          </View>
        }
        renderItem={({ item: scan }) => {
          const isExpanded = expandedId === scan.id;
          const totalQty = scan.items.reduce((sum, it) => sum + it.quantity, 0);

          return (
            <Pressable
              onPress={() => setExpandedId(isExpanded ? null : scan.id)}
              style={({ pressed }) => [pressed && { opacity: 0.95 }]}
            >
              <Card style={styles.scanCard}>
                {/* Header row */}
                <View style={styles.scanHeader}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.scanDate}>{formatDate(scan.createdAt)}</Text>
                    <Text style={styles.scanCount}>
                      {totalQty} item{totalQty === 1 ? '' : 's'} detected
                    </Text>
                  </View>
                  <View style={styles.speedBadge}>
                    <Ionicons name="flash" size={12} color="#1565C0" />
                    <Text style={styles.speedText}>{Math.round(scan.latencyMs)} ms</Text>
                  </View>
                </View>

                {/* Items detected pills */}
                <View style={styles.itemsWrap}>
                  {scan.items.map((it, idx) => (
                    <View key={idx} style={styles.itemPill}>
                      <Text style={{ fontSize: 16 }}>{it.emoji}</Text>
                      <Text style={styles.itemPillText}>
                        {it.name} <Text style={{ fontWeight: '800' }}>× {it.quantity}</Text>
                      </Text>
                      <Text style={styles.storageIcon}>
                        {it.storage === 'fridge' ? '❄️' : '🏠'}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Expanded Telemetry Details */}
                {isExpanded && (
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Model Version:</Text>
                      <Text style={styles.detailValue}>{scan.detectorVersion}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Inference Latency:</Text>
                      <Text style={styles.detailValue}>
                        {scan.timings?.inference != null
                          ? `${Math.round(scan.timings.inference)} ms`
                          : `${Math.round(scan.latencyMs)} ms`}
                      </Text>
                    </View>
                    {scan.timings?.preprocess != null && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Preprocess / NMS:</Text>
                        <Text style={styles.detailValue}>
                          {Math.round(scan.timings.preprocess)} ms /{' '}
                          {Math.round(scan.timings.postprocess ?? 0)} ms
                        </Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Scan ID:</Text>
                      <Text style={[styles.detailValue, { fontSize: 11, color: C.muted }]}>
                        {scan.id.slice(0, 16)}…
                      </Text>
                    </View>
                  </View>
                )}

                {/* Card footer indicator */}
                <View style={styles.cardFooter}>
                  <Text style={styles.tapDetailsText}>
                    {isExpanded ? 'Hide telemetry details' : 'Tap to view inference details'}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={C.muted}
                  />
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 12,
  },
  headerContainer: {
    gap: 14,
    marginBottom: 4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...S.card,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: C.primaryDark,
  },
  statLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: C.borderLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },
  scanCard: {
    padding: 14,
    gap: 10,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  scanDate: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
  },
  scanCount: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.full,
  },
  speedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1565C0',
  },
  itemsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  itemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  itemPillText: {
    fontSize: 13,
    color: C.text,
    fontWeight: '600',
  },
  storageIcon: {
    fontSize: 12,
  },
  detailsContainer: {
    gap: 6,
    marginTop: 4,
  },
  detailDivider: {
    height: 1,
    backgroundColor: C.borderLight,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: C.text,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    marginTop: 2,
  },
  tapDetailsText: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '600',
  },
});
