import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bar, Card, Muted, Screen, ScreenHeader } from '../components/ui';
import { NUTRIENT_KEYS, getCatalogItem, nutrientsForGrams } from '../domain/catalog';
import { activeItems, usePantry } from '../store/pantryStore';
import { useSettings } from '../store/settingsStore';
import { C, R } from '../theme';

const LABEL: Record<string, { name: string; unit: string; icon: string }> = {
  kcal: { name: 'Calories', unit: 'kcal', icon: '🔥' },
  carbs_g: { name: 'Carbs', unit: 'g', icon: '🍞' },
  fiber_g: { name: 'Fibre', unit: 'g', icon: '🌾' },
  vitamin_c_mg: { name: 'Vitamin C', unit: 'mg', icon: '🍊' },
  protein_g: { name: 'Protein', unit: 'g', icon: '💪' },
};

export default function Nutrition() {
  const router = useRouter();
  const { logs, items } = usePantry();
  const targets = useSettings((s) => s.targets);

  const { today, week, pantry, dayLabels } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const t0 = start.getTime();

    const today: Record<string, number> = Object.fromEntries(
      NUTRIENT_KEYS.map((k) => [k, 0])
    );
    const week = Array.from({ length: 7 }, () => 0);

    for (const l of logs) {
      const daysAgo = l.date >= t0 ? 0 : Math.floor((t0 - l.date) / 86400000) + 1;
      if (daysAgo === 0) {
        NUTRIENT_KEYS.forEach((k) => (today[k] += l.nutrients[k] ?? 0));
      }
      if (daysAgo >= 0 && daysAgo < 7) {
        week[6 - daysAgo] += l.nutrients.kcal ?? 0;
      }
    }

    const dayLabels: string[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let offset = 6; offset >= 0; offset--) {
      if (offset === 0) {
        dayLabels.push('Today');
      } else {
        const d = new Date(t0 - offset * 86400000);
        dayLabels.push(dayNames[d.getDay()]);
      }
    }

    const pantry: Record<string, number> = Object.fromEntries(
      NUTRIENT_KEYS.map((k) => [k, 0])
    );
    for (const i of activeItems(items)) {
      const n = nutrientsForGrams(
        i.classKey,
        i.quantity * getCatalogItem(i.classKey).grams_per_item
      );
      NUTRIENT_KEYS.forEach((k) => (pantry[k] += n[k]));
    }

    return { today, week, pantry, dayLabels };
  }, [logs, items]);

  const maxW = Math.max(1, ...week);
  const weekTotal = week.reduce((a, b) => a + b, 0);

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <ScreenHeader
        title="Nutrition"
        subtitle="Daily targets & 7-day intake overview"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today vs Targets */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Today vs Targets</Text>
            <Muted>Logged automatically on consumption</Muted>
          </View>

          {NUTRIENT_KEYS.map((k) => {
            const info = LABEL[k];
            const current = Math.round(today[k]);
            const target = targets[k];
            const pct = Math.round((100 * current) / target);

            return (
              <View key={k} style={styles.nutrientRow}>
                <View style={styles.nutrientHeader}>
                  <Text style={styles.nutrientName}>
                    {info.icon} {info.name}
                  </Text>
                  <Text style={styles.nutrientValue}>
                    <Text style={{ fontWeight: '800', color: C.text }}>{current}</Text> /{' '}
                    {target} {info.unit} ({pct}%)
                  </Text>
                </View>
                <Bar pct={pct} height={8} />
              </View>
            );
          })}
        </Card>

        {/* 7-day Calorie chart */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Calories (Last 7 Days)</Text>
            <Muted>{weekTotal > 0 ? `Total: ${Math.round(weekTotal)} kcal` : 'No logs yet'}</Muted>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.barsRow}>
              {week.map((v, i) => {
                const isToday = i === 6;
                const barH = Math.max(6, (v / maxW) * 90);

                return (
                  <View key={i} style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: barH,
                            backgroundColor: isToday ? C.primary : '#A5D6A7',
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.dayLabel,
                        isToday && { color: C.primaryDark, fontWeight: '800' },
                      ]}
                    >
                      {dayLabels[i]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Card>

        {/* Pantry Current Nutrients */}
        <Card style={styles.cardSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>In Your Pantry Right Now</Text>
            <Muted>Nutritional value of current fresh inventory</Muted>
          </View>

          <View style={styles.pantryNutrientsGrid}>
            {NUTRIENT_KEYS.map((k) => {
              const info = LABEL[k];
              return (
                <View key={k} style={styles.pantryNutrientItem}>
                  <Text style={styles.pantryNutrientIcon}>{info.icon}</Text>
                  <Text style={styles.pantryNutrientNumber}>
                    {Math.round(pantry[k]).toLocaleString()}
                  </Text>
                  <Text style={styles.pantryNutrientLabel}>
                    {info.name} ({info.unit})
                  </Text>
                </View>
              );
            })}
          </View>
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
  sectionTitleRow: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
  },
  nutrientRow: {
    gap: 6,
  },
  nutrientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutrientName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  nutrientValue: {
    fontSize: 13,
    color: C.muted,
  },
  chartContainer: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 8,
  },
  barCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '80%',
    maxWidth: 24,
    borderRadius: R.xs,
  },
  dayLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '600',
  },
  pantryNutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  pantryNutrientItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FAFBF9',
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: R.md,
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  pantryNutrientIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  pantryNutrientNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  pantryNutrientLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '600',
  },
});
