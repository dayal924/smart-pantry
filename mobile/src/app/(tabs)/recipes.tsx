import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bar, Btn, Card, EmptyState, Muted, Screen, ScreenHeader } from '../../components/ui';
import { getCatalogItem } from '../../domain/catalog';
import { matchRecipes, nameOf } from '../../domain/recipeMatch';
import { activeItems, usePantry } from '../../store/pantryStore';
import { C, R } from '../../theme';

export default function Recipes() {
  const router = useRouter();
  const { items, recipes, customRecipes = [], cook, removeCustomRecipe } = usePantry();
  const [tab, setTab] = useState<'my' | 'catalog'>('my');
  const [open, setOpen] = useState<string | null>(null);

  const active = useMemo(() => activeItems(items), [items]);
  const now = Date.now();

  const myMatches = useMemo(
    () => matchRecipes(active, now, customRecipes),
    [active, customRecipes, now]
  );

  const catalogMatches = useMemo(
    () =>
      matchRecipes(active, now, recipes)
        .filter((m) => m.overlap > 0)
        .slice(0, 30),
    [active, recipes, now]
  );

  const displayedMatches = tab === 'my' ? myMatches : catalogMatches;

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Recipes"
        subtitle="Step-by-step cooking instructions & pantry deduction"
        rightAction={
          <Btn
            kind="soft"
            title="+ Copilot"
            onPress={() => router.push('/(tabs)/copilot')}
            style={{ paddingVertical: 6, paddingHorizontal: 12, minHeight: 36 }}
          />
        }
      />

      {/* Segment Tab Controls */}
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setTab('my')}
          style={[styles.tabBtn, tab === 'my' && styles.tabBtnActive]}
        >
          <Ionicons
            name="sparkles"
            size={14}
            color={tab === 'my' ? C.primaryDark : C.muted}
          />
          <Text style={[styles.tabBtnText, tab === 'my' && styles.tabBtnTextActive]}>
            My Recipes ({customRecipes.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setTab('catalog')}
          style={[styles.tabBtn, tab === 'catalog' && styles.tabBtnActive]}
        >
          <Ionicons
            name="book-outline"
            size={14}
            color={tab === 'catalog' ? C.primaryDark : C.muted}
          />
          <Text style={[styles.tabBtnText, tab === 'catalog' && styles.tabBtnTextActive]}>
            Explore Catalog ({catalogMatches.length})
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={displayedMatches}
        keyExtractor={(m) => m.recipe.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          tab === 'my' ? (
            <EmptyState
              emoji="🍳"
              title="No recipes saved yet"
              subtitle="Pick items from your pantry and chat with Copilot to create and save custom recipes with full step-by-step instructions!"
              actionTitle="Create with Copilot"
              onAction={() => router.push('/(tabs)/copilot')}
            />
          ) : (
            <EmptyState
              emoji="🥗"
              title="No catalog matches"
              subtitle="Scan or add produce into your pantry to automatically discover catalog recipe ideas."
              actionTitle="Scan Produce"
              onAction={() => router.push('/(tabs)/scan')}
            />
          )
        }
        renderItem={({ item: m }) => {
          const isOpen = open === m.recipe.id;
          const rescueCount = m.urgentNow.length + m.urgentSoon.length;
          const isCustom = customRecipes.some((r) => r.id === m.recipe.id);

          return (
            <Card style={styles.recipeCard}>
              <Pressable
                onPress={() => setOpen(isOpen ? null : m.recipe.id)}
                style={styles.cardHeaderPressable}
              >
                <View style={styles.cardTitleRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.recipeTitle}>{m.recipe.title}</Text>
                    {isCustom && (
                      <View style={styles.copilotBadge}>
                        <Text style={styles.copilotBadgeText}>✨ Copilot Created</Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={[
                      styles.matchPill,
                      {
                        backgroundColor:
                          m.overlap === 100
                            ? C.primarySoft
                            : m.overlap >= 50
                            ? '#FFF9C4'
                            : '#F5F5F5',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.matchPillText,
                        {
                          color:
                            m.overlap === 100
                              ? C.primaryDark
                              : m.overlap >= 50
                              ? '#F57F17'
                              : C.muted,
                        },
                      ]}
                    >
                      {m.overlap}% match
                    </Text>
                  </View>
                </View>

                <Bar pct={m.overlap} color={m.overlap === 100 ? C.primary : '#FBC02D'} height={6} />

                <View style={styles.metaRow}>
                  <View style={styles.metaBadge}>
                    <Ionicons name="time-outline" size={13} color={C.muted} />
                    <Text style={styles.metaText}>{m.recipe.time_min}m</Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <Ionicons name="people-outline" size={13} color={C.muted} />
                    <Text style={styles.metaText}>Serves {m.recipe.servings}</Text>
                  </View>
                  {rescueCount > 0 && (
                    <View style={styles.rescueBadge}>
                      <Text style={styles.rescueText}>♻️ Rescues {rescueCount}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }} />
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={C.muted}
                  />
                </View>
              </Pressable>

              {isOpen && (
                <View style={styles.expandedContent}>
                  <View style={styles.ingredientSection}>
                    <Text style={styles.sectionTitle}>✅ In your pantry</Text>
                    <View style={styles.tagWrap}>
                      {m.have.length > 0 ? (
                        m.have.map((k) => {
                          const item = getCatalogItem(k);
                          return (
                            <View key={k} style={styles.haveTag}>
                              <Text style={styles.tagText}>
                                {item.emoji} {nameOf(k)}
                              </Text>
                            </View>
                          );
                        })
                      ) : (
                        <Muted>None in pantry yet</Muted>
                      )}
                    </View>
                  </View>

                  {m.missing.length > 0 && (
                    <View style={styles.ingredientSection}>
                      <Text style={[styles.sectionTitle, { color: C.danger }]}>
                        🛒 Missing items
                      </Text>
                      <View style={styles.tagWrap}>
                        {m.missing.map((k) => (
                          <View key={k} style={styles.missingTag}>
                            <Text style={[styles.tagText, { color: C.danger }]}>
                              {nameOf(k)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {m.recipe.staples && m.recipe.staples.length > 0 && (
                    <View style={styles.staplesRow}>
                      <Muted>Staples: {m.recipe.staples.join(', ')}</Muted>
                    </View>
                  )}

                  <View style={styles.stepsSection}>
                    <Text style={styles.sectionTitle}>Step-by-Step Instructions</Text>
                    {m.recipe.steps.map((step, idx) => (
                      <View key={idx} style={styles.stepRow}>
                        <View style={styles.stepNumberBadge}>
                          <Text style={styles.stepNumberText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>

                  <Btn
                    title={m.missing.length > 0 ? 'Missing ingredients' : '✓ Mark cooked & deduct'}
                    disabled={m.missing.length > 0}
                    onPress={() =>
                      Alert.alert(
                        'Mark as cooked?',
                        'Ingredients are deducted from your pantry (soonest-expiring first) and nutrition is logged.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Cook',
                            onPress: () => {
                              const r = cook(m.recipe);
                              Alert.alert('Logged', `Used ${r.used.length} ingredient(s).`);
                            },
                          },
                        ]
                      )
                    }
                    style={{ marginTop: 8 }}
                  />

                  {isCustom && (
                    <Btn
                      kind="ghost"
                      title="🗑 Remove from My Recipes"
                      onPress={() =>
                        Alert.alert('Remove recipe?', `Delete "${m.recipe.title}"?`, [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: () => removeCustomRecipe(m.recipe.id),
                          },
                        ])
                      }
                      style={{ marginTop: 4 }}
                    />
                  )}
                </View>
              )}
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#EBEFE9',
    borderRadius: R.md,
    padding: 3,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: R.sm,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.muted,
  },
  tabBtnTextActive: {
    color: C.primaryDark,
  },
  copilotBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: R.sm,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  copilotBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B5E20',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 36,
    gap: 12,
  },
  recipeCard: {
    padding: 14,
    gap: 10,
  },
  cardHeaderPressable: {
    gap: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
    flex: 1,
  },
  matchPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: R.full,
  },
  matchPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
  },
  metaText: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
  },
  rescueBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
  },
  rescueText: {
    fontSize: 11,
    color: C.primaryDark,
    fontWeight: '700',
  },
  expandedContent: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    gap: 12,
  },
  ingredientSection: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  haveTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: R.sm,
  },
  missingTag: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: R.sm,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.text,
  },
  staplesRow: {
    backgroundColor: '#F9F9F9',
    padding: 8,
    borderRadius: R.sm,
  },
  stepsSection: {
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.primaryDark,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    color: C.text,
    flex: 1,
  },
});
