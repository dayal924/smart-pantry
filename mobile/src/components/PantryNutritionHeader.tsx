import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { calculatePantryNutrition } from '../domain/produceBenefits';
import { useSettings } from '../store/settingsStore';
import type { PantryItem } from '../store/pantryStore';
import { C, R, S } from '../theme';

interface PantryNutritionHeaderProps {
  activePantry: PantryItem[];
  onCookPress: () => void;
}

export function PantryNutritionHeader({ activePantry, onCookPress }: PantryNutritionHeaderProps) {
  const [expanded, setExpanded] = useState(false);
  const targets = useSettings((s) => s.targets);

  if (activePantry.length === 0) return null;

  const summary = calculatePantryNutrition(activePantry, targets);
  const n = summary.nutrients;
  const p = summary.dailyTargetPct;

  return (
    <View style={styles.cardContainer}>
      {/* Top Banner Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Text style={{ fontSize: 18 }}>🥦</Text>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.mainTitle}>Pantry Nutrition Bank</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>
              {summary.totalItems} fresh item{summary.totalItems === 1 ? '' : 's'} · {summary.totalGrams}g whole produce
            </Text>
          </View>
        </View>

        <Pressable onPress={onCookPress} style={styles.cookBtn}>
          <Text style={styles.cookBtnText}>✨ Cook</Text>
        </Pressable>
      </View>

      {/* 4 Nutrient Stat Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricEmoji}>🔥</Text>
          <Text style={styles.metricValue}>{Math.round(n.kcal)}</Text>
          <Text style={styles.metricLabel}>Calories</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricEmoji}>🍊</Text>
          <Text style={styles.metricValue}>{n.vitamin_c_mg}mg</Text>
          <Text style={styles.metricLabel}>Vit C ({p.vitamin_c_mg}%)</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricEmoji}>🌾</Text>
          <Text style={styles.metricValue}>{n.fiber_g}g</Text>
          <Text style={styles.metricLabel}>Fiber ({p.fiber_g}%)</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricEmoji}>🥩</Text>
          <Text style={styles.metricValue}>{n.protein_g}g</Text>
          <Text style={styles.metricLabel}>Protein</Text>
        </View>
      </View>

      {/* Expand/Collapse Toggle */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={styles.toggleRow}
        hitSlop={8}
      >
        <Text style={styles.toggleText}>
          {expanded ? 'Hide Nutrition & Health Benefits' : '✨ View Vitamins & Superpower Benefits'}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color="#2E7D32"
        />
      </Pressable>

      {/* Detailed Expanded Drawer */}
      {expanded && (
        <View style={styles.expandedSection}>
          {/* Progress Bars toward Daily Nutrition Targets */}
          <View style={styles.targetsContainer}>
            <Text style={styles.sectionSubtitle}>Daily Target Coverage in Pantry</Text>

            <View style={styles.progressRow}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressName}>🍊 Vitamin C</Text>
                <Text style={styles.progressPercent}>{p.vitamin_c_mg}% of daily target</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, p.vitamin_c_mg)}%`,
                      backgroundColor: p.vitamin_c_mg >= 100 ? '#2E7D32' : '#FF9800',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.progressRow}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressName}>🌾 Dietary Fiber</Text>
                <Text style={styles.progressPercent}>{p.fiber_g}% of daily target</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, p.fiber_g)}%`,
                      backgroundColor: p.fiber_g >= 100 ? '#2E7D32' : '#4CAF50',
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Unlocked Pantry Superpowers */}
          {summary.unlockedSuperpowers.length > 0 && (
            <View style={styles.superpowersContainer}>
              <Text style={styles.sectionSubtitle}>Unlocked Health Benefits</Text>
              <View style={{ gap: 8 }}>
                {summary.unlockedSuperpowers.map((sp, idx) => (
                  <View key={idx} style={styles.superpowerItem}>
                    <Text style={{ fontSize: 20 }}>{sp.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.superpowerTitle}>{sp.title}</Text>
                      <Text style={styles.superpowerDesc}>{sp.description}</Text>
                      {sp.sources.length > 0 && (
                        <Text style={styles.superpowerSources}>
                          Supplied by: {sp.sources.join(', ')}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#F1F8F1',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4E7D5',
    padding: 14,
    marginBottom: 12,
    ...S.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  mainTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#1B5E20',
  },
  subtitle: {
    fontSize: 12,
    color: '#4B634E',
    marginTop: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
  },
  liveText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  cookBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cookBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2ECE3',
  },
  metricEmoji: {
    fontSize: 14,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C2A1E',
  },
  metricLabel: {
    fontSize: 10,
    color: '#657D68',
    marginTop: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    marginTop: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  expandedSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#D8E8D9',
    gap: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  targetsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2ECE3',
  },
  progressRow: {
    marginBottom: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  progressName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C2A1E',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#EBEFEB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  superpowersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2ECE3',
  },
  superpowerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 6,
  },
  superpowerTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1C2A1E',
  },
  superpowerDesc: {
    fontSize: 11.5,
    color: '#4B634E',
    marginTop: 1,
    lineHeight: 16,
  },
  superpowerSources: {
    fontSize: 10.5,
    fontStyle: 'italic',
    color: '#2E7D32',
    marginTop: 2,
  },
});
