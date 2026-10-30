import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { ClassPicker } from '../../components/ClassPicker';
import { ItemNutritionSection } from '../../components/ItemNutritionSection';
import { PantryNutritionHeader } from '../../components/PantryNutritionHeader';
import { Btn, Card, Chip, EmptyState, Muted, Screen, ScreenHeader } from '../../components/ui';
import { getCatalogItem } from '../../domain/catalog';
import { URGENCY_META, URGENCY_ORDER, Urgency, daysLeft, urgencyOf } from '../../domain/shelfLife';
import { PantryItem, activeItems, fmtQty, usePantry } from '../../store/pantryStore';
import { C, R, S } from '../../theme';

export default function Pantry() {
  const router = useRouter();
  const { items, setStorage, closeItem, addEntries, dirtyItems } = usePantry();
  const [adding, setAdding] = useState(false);
  const now = Date.now();
  const active = useMemo(() => activeItems(items), [items]);

  const sections = useMemo(() => {
    const by: Record<Urgency, PantryItem[]> = {
      expired: [],
      use_now: [],
      use_soon: [],
      fresh_later: [],
    };
    for (const i of active) by[urgencyOf(i.expiresAt, now)].push(i);
    return URGENCY_ORDER.filter((u) => by[u].length).map((u) => ({
      u,
      data: by[u].sort((a, b) => a.expiresAt - b.expiresAt),
    }));
  }, [active, now]);

  const waste = useMemo(() => {
    const since = now - 30 * 86400000;
    let c = 0,
      d = 0;
    for (const i of items) {
      if (i.closedAt && i.closedAt >= since) {
        if (i.status === 'consumed') c += i.quantity;
        else if (i.status === 'discarded') d += i.quantity;
      }
    }
    return { c, d, pct: c + d ? Math.round((100 * d) / (c + d)) : 0 };
  }, [items, now]);

  const close = (i: PantryItem, status: 'consumed' | 'discarded') => {
    const verb = status === 'consumed' ? 'Consumed' : 'Discarded';
    if (i.quantity > 1.05) {
      Alert.alert(
        `${verb} ${i.name}`,
        `You have ${fmtQty(i.quantity)} in this batch.`,
        [
          { text: 'Just 1', onPress: () => closeItem(i.id, status, 1) },
          { text: 'All', onPress: () => closeItem(i.id, status) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      closeItem(i.id, status);
    }
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Pantry Inventory"
        rightAction={
          <Btn
            kind="soft"
            title="+ Add"
            onPress={() => setAdding(true)}
            style={{ paddingVertical: 8, paddingHorizontal: 14, minHeight: 38 }}
          />
        }
        subtitle={
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statNumber}>{active.length}</Text>
              <Text style={styles.statLabel}>items</Text>
            </View>
            <View style={styles.statDot} />
            <Text style={styles.statSub}>
              {dirtyItems.length ? `${dirtyItems.length} to sync` : 'Synced'}
            </Text>
            <View style={styles.statDot} />
            <Text style={styles.statSub}>
              {fmtQty(waste.c)} used · {waste.pct}% waste (30d)
            </Text>
          </View>
        }
      />

      <SectionList
        sections={sections}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          active.length > 0 ? (
            <PantryNutritionHeader
              activePantry={active}
              onCookPress={() => router.push('/(tabs)/copilot')}
            />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            emoji="🥑"
            title="Your pantry is empty"
            subtitle="Scan groceries with the camera or tap '+ Add' to track freshness and avoid food waste."
            actionTitle="+ Add produce"
            onAction={() => setAdding(true)}
          />
        }
        renderSectionHeader={({ section }) => {
          const m = URGENCY_META[section.u];
          return (
            <View style={[styles.sectionHeader, { backgroundColor: m.bg }]}>
              <Text style={{ fontSize: 14 }}>{m.emoji}</Text>
              <Text style={[styles.sectionHeaderText, { color: m.color }]}>
                {m.label.toUpperCase()}
              </Text>
              <View style={[styles.countBadge, { backgroundColor: m.color }]}>
                <Text style={styles.countBadgeText}>{section.data.length}</Text>
              </View>
            </View>
          );
        }}
        renderItem={({ item: i, section }) => {
          const m = URGENCY_META[section.u];
          const d = daysLeft(i.expiresAt, now);
          const isExpired = section.u === 'expired';
          const cat = getCatalogItem(i.classKey);
          const isFridgeRec = cat.default_storage === 'fridge';
          const isOptimalStorage = i.storage === cat.default_storage;

          return (
            <Card style={[styles.itemCard, { borderLeftColor: m.color, borderLeftWidth: 4 }]}>
              <View style={styles.itemHeader}>
                <View style={styles.itemNameContainer}>
                  <Text style={styles.itemEmoji}>{i.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {i.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Text style={styles.itemQty}>Qty: {fmtQty(i.quantity)}</Text>
                      {isOptimalStorage && (
                        <View style={styles.optimalBadge}>
                          <Text style={styles.optimalText}>✨ Optimal Storage</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={[styles.urgencyTag, { backgroundColor: m.bg }]}>
                  <Text style={[styles.urgencyText, { color: m.color }]}>
                    {isExpired ? 'Expired' : d <= 0 ? 'Use today' : `${d}d left`}
                  </Text>
                </View>
              </View>

              <View style={styles.storageRow}>
                <Text style={styles.storageLabel}>Storage:</Text>
                <Chip
                  label={`🏠 Room${!isFridgeRec ? ' ⭐' : ''}`}
                  active={i.storage === 'room'}
                  onPress={() => setStorage(i.id, 'room')}
                />
                <Chip
                  label={`❄️ Fridge${isFridgeRec ? ' ⭐' : ''}`}
                  active={i.storage === 'fridge'}
                  onPress={() => setStorage(i.id, 'fridge')}
                />
              </View>

              {cat.tip ? (
                <View style={styles.pantryTipBox}>
                  <Text style={styles.pantryTipText}>💡 {cat.tip}</Text>
                </View>
              ) : null}

              {/* Per-Item Nutrition & Health Benefits Tracker */}
              <ItemNutritionSection
                classKey={i.classKey}
                name={i.name}
                quantity={i.quantity}
              />

              <View style={styles.actionRow}>
                <Btn
                  title="✓ Consumed"
                  kind="soft"
                  onPress={() => close(i, 'consumed')}
                  style={{ flex: 1, minHeight: 38, paddingVertical: 8 }}
                />
                <Btn
                  title="🗑 Discarded"
                  kind="ghost"
                  onPress={() => close(i, 'discarded')}
                  style={{ flex: 1, minHeight: 38, paddingVertical: 8 }}
                />
              </View>
            </Card>
          );
        }}
      />

      <ClassPicker
        visible={adding}
        onClose={() => setAdding(false)}
        title="Add to pantry"
        onPick={(k) => {
          addEntries([{ classKey: k, quantity: 1, source: 'manual' }]);
          setAdding(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: R.full,
  },
  statNumber: {
    fontWeight: '800',
    color: C.primaryDark,
    fontSize: 12,
  },
  statLabel: {
    fontWeight: '600',
    color: C.primaryDark,
    fontSize: 12,
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.muted,
  },
  statSub: {
    color: C.muted,
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 36,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.md,
    marginTop: 10,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  sectionHeaderText: {
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: R.full,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 10,
  },
  itemCard: {
    gap: 12,
    padding: 14,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },
  itemQty: {
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },
  urgencyTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: R.full,
  },
  urgencyText: {
    fontWeight: '800',
    fontSize: 12,
  },
  storageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
  },
  pantryBanner: {
    backgroundColor: '#F1F8E9',
    borderColor: '#C8E6C9',
    borderWidth: 1,
    borderRadius: R.md,
    padding: 12,
    gap: 4,
    marginBottom: 6,
  },
  copilotShortcutBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
  },
  copilotShortcutText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  pantryBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: C.primaryDark,
  },
  pantryBannerSub: {
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 17,
  },
  optimalBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: R.sm,
  },
  optimalText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B5E20',
  },
  pantryTipBox: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 8,
    borderRadius: R.sm,
  },
  pantryTipText: {
    fontSize: 11,
    color: C.textSecondary,
    lineHeight: 16,
  },
});
