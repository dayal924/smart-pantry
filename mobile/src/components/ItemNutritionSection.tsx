import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getCatalogItem, nutrientsForGrams } from '../domain/catalog';
import { getProduceBenefits } from '../domain/produceBenefits';
import { C, R } from '../theme';

interface ItemNutritionSectionProps {
  classKey: string;
  name: string;
  quantity: number;
}

export function ItemNutritionSection({ classKey, name, quantity }: ItemNutritionSectionProps) {
  const [open, setOpen] = useState(false);

  const cat = getCatalogItem(classKey);
  const totalGrams = Math.round((quantity ?? 1) * cat.grams_per_item);
  const n = nutrientsForGrams(classKey, totalGrams);
  const info = getProduceBenefits(classKey);

  return (
    <View style={styles.container}>
      {/* Quick Nutrients Pill Row */}
      <View style={styles.summaryBar}>
        <View style={styles.nutrientsQuickRow}>
          <Text style={styles.quickPill}>🔥 {Math.round(n.kcal)} kcal</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.quickPill}>🌾 {n.fiber_g}g fiber</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.quickPill}>🍊 {n.vitamin_c_mg}mg Vit C</Text>
        </View>

        <Pressable
          onPress={() => setOpen(!open)}
          style={styles.toggleBtn}
          hitSlop={6}
        >
          <Text style={styles.toggleBtnText}>
            {open ? 'Hide' : 'Nutrients & Benefits'}
          </Text>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={12}
            color="#2E7D32"
          />
        </Pressable>
      </View>

      {/* Expanded Nutrients & Health Benefits Drawer */}
      {open && (
        <View style={styles.drawer}>
          {/* Key Vitamins & Minerals Chips */}
          <View style={styles.sectionBlock}>
            <Text style={styles.drawerSectionTitle}>KEY VITAMINS & MINERALS</Text>
            <View style={styles.vitaminsRow}>
              {info.vitamins.map((v, i) => (
                <View key={i} style={styles.vitaminBadge}>
                  <Text style={styles.vitaminText}>{v}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Health Benefits Checklist */}
          <View style={styles.sectionBlock}>
            <Text style={styles.drawerSectionTitle}>HEALTH & WELLNESS BENEFITS</Text>
            <View style={{ gap: 4 }}>
              {info.benefits.map((b, i) => (
                <View key={i} style={styles.benefitRow}>
                  <Text style={styles.checkIcon}>✓</Text>
                  <Text style={styles.benefitText}>{b}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Full Macro Table for this Batch */}
          <View style={styles.macrosBox}>
            <View style={styles.macroCol}>
              <Text style={styles.macroVal}>{Math.round(n.kcal)}</Text>
              <Text style={styles.macroLbl}>Calories</Text>
            </View>
            <View style={styles.macroCol}>
              <Text style={styles.macroVal}>{n.carbs_g}g</Text>
              <Text style={styles.macroLbl}>Carbs</Text>
            </View>
            <View style={styles.macroCol}>
              <Text style={styles.macroVal}>{n.fiber_g}g</Text>
              <Text style={styles.macroLbl}>Fiber</Text>
            </View>
            <View style={styles.macroCol}>
              <Text style={styles.macroVal}>{n.vitamin_c_mg}mg</Text>
              <Text style={styles.macroLbl}>Vit C</Text>
            </View>
            <View style={styles.macroCol}>
              <Text style={styles.macroVal}>{n.protein_g}g</Text>
              <Text style={styles.macroLbl}>Protein</Text>
            </View>
          </View>

          {/* Punchy Highlight */}
          {info.highlight ? (
            <View style={styles.highlightRow}>
              <Text style={{ fontSize: 13 }}>💡</Text>
              <Text style={styles.highlightText}>{info.highlight}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 4,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAF7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E8EFE8',
  },
  nutrientsQuickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  quickPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  dot: {
    fontSize: 9,
    color: '#A0B2A2',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 6,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  drawer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2ECE3',
    padding: 10,
    marginTop: 6,
    gap: 8,
  },
  sectionBlock: {
    gap: 4,
  },
  drawerSectionTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  vitaminsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  vitaminBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  vitaminText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1B5E20',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  checkIcon: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E7D32',
    marginTop: 1,
  },
  benefitText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#1C2A1E',
  },
  macrosBox: {
    flexDirection: 'row',
    backgroundColor: '#F9FBF9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAF0EB',
    paddingVertical: 6,
  },
  macroCol: {
    flex: 1,
    alignItems: 'center',
  },
  macroVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C2A1E',
  },
  macroLbl: {
    fontSize: 9,
    color: '#657D68',
    marginTop: 1,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  highlightText: {
    flex: 1,
    fontSize: 11,
    color: '#7A5E0B',
    lineHeight: 15,
    fontStyle: 'italic',
  },
});
