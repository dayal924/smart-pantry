import raw from '../data/produce_catalog.json';

export type Storage = 'room' | 'fridge';
export const NUTRIENT_KEYS = ['kcal', 'carbs_g', 'fiber_g', 'vitamin_c_mg', 'protein_g'] as const;
export type NutrientKey = (typeof NUTRIENT_KEYS)[number];
export type Nutrients = Record<NutrientKey, number>;

export interface CatalogItem {
  key: string;
  display: string;
  emoji: string;
  category: string;
  shelf_life_days: Record<Storage, number>;
  default_storage: Storage;
  grams_per_item: number;
  nutrition_per_100g: Nutrients;
  tip: string;
}

const items = raw.items as unknown as Record<string, Omit<CatalogItem, 'key'>>;
const aliases = raw.aliases as Record<string, string>;

/** Must match backend/app/services/catalog.py normalize_key(). */
export function normalizeKey(label: string): string {
  const k = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return aliases[k] ?? k;
}

const GENERIC = {
  emoji: '🥗', category: 'produce', shelf_life_days: { room: 5, fridge: 10 }, default_storage: 'fridge' as Storage,
  grams_per_item: 150, nutrition_per_100g: { kcal: 40, carbs_g: 9, fiber_g: 2, vitamin_c_mg: 15, protein_g: 1 }, tip: '',
};

export function getCatalogItem(keyOrLabel: string): CatalogItem {
  const key = normalizeKey(keyOrLabel);
  const hit = items[key];
  if (hit) return { key, ...hit };
  return { key, display: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), ...GENERIC };
}

export const allCatalog = (): CatalogItem[] => Object.keys(items).map((k) => ({ key: k, ...items[k] }));

export function nutrientsForGrams(key: string, grams: number): Nutrients {
  const n = getCatalogItem(key).nutrition_per_100g;
  const out = {} as Nutrients;
  for (const k of NUTRIENT_KEYS) out[k] = Math.round(((n[k] * grams) / 100) * 100) / 100;
  return out;
}
