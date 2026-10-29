import produceCatalogRaw from './produce_catalog.json';
import labelsRaw from './labels.json';
import recipesRaw from './recipes.json';
import expectedRaw from './expected.json';

export interface ProduceItem {
  id: string;
  display: string;
  emoji: string;
  category: 'fruit' | 'vegetable' | 'herb' | 'legume' | 'grain' | 'other';
  shelf_life_days: {
    room: number;
    fridge: number;
  };
  default_storage: 'room' | 'fridge';
  grams_per_item: number;
  nutrition_per_100g: {
    kcal: number;
    carbs_g: number;
    protein_g?: number;
    fat_g?: number;
    fiber_g?: number;
  };
}

export interface Detection {
  class_id: number;
  className: string;
  emoji: string;
  score: number;
  bbox: [number, number, number, number]; // [cx, cy, w, h] normalized
}

export const LABELS: string[] = labelsRaw.names;

export const PRODUCE_ITEMS: Record<string, ProduceItem> = produceCatalogRaw.items as any;

export interface Recipe {
  id: string;
  title: string;
  time_min: number;
  servings: number;
  ingredients: Array<{ key: string; grams: number; optional: boolean }>;
  staples: string[];
  steps: string[];
}

export const RECIPES: Recipe[] = recipesRaw as Recipe[];

// Helper to look up produce info by class id or name
export function getProduceByClass(classNameOrId: string | number): ProduceItem | undefined {
  let name = typeof classNameOrId === 'number' ? LABELS[classNameOrId] : classNameOrId;
  if (!name) return undefined;
  const key = name.toLowerCase().replace(/\s+/g, '_');
  const aliasTarget = (produceCatalogRaw.aliases as any)[key];
  return PRODUCE_ITEMS[key] ?? (aliasTarget ? PRODUCE_ITEMS[aliasTarget] : undefined);
}

export function getEmojiForClass(className: string): string {
  const item = getProduceByClass(className);
  if (item?.emoji) return item.emoji;
  const map: Record<string, string> = {
    Apple: '🍎', Banana: '🍌', Beetroot: '🫐', Bitter_Gourd: '🥒', Bottle_Gourd: '🥒',
    Cabbage: '🥬', Capsicum: '🫑', Carrot: '🥕', Cauliflower: '🥦', Cherry: '🍒',
    Chilli: '🌶️', Coconut: '🥥', Cucumber: '🥒', EggPlant: '🍆', Ginger: '🫚',
    Grape: '🍇', Green_Orange: '🍊', Kiwi: '🥝', Maize: '🌽', Mango: '🥭',
    Melon: '🍈', Okra: '🥢', Onion: '🧅', Orange: '🍊', Peach: '🍑',
    Pear: '🍐', Peas: '🫛', Pineapple: '🍍', Pomegranate: '🪵', Potato: '🥔',
    Radish: '🥕', Strawberry: '🍓', Tomato: '🍅', Turnip: '🪴', Watermelon: '🍉',
  };
  return map[className] || '🥑';
}

// Selftest sample images
export const SAMPLE_DETECTIONS = (expectedRaw.images as Array<any>).map((img, idx) => ({
  id: `sample-${idx}`,
  fileName: img.file,
  src: `./selftest/${img.file}`,
  width: img.width,
  height: img.height,
  detections: img.dets.map((d: any) => ({
    class_id: d.class_id,
    className: LABELS[d.class_id] || 'Produce',
    emoji: getEmojiForClass(LABELS[d.class_id]),
    score: d.score,
    bbox: d.bbox,
  })) as Detection[],
}));

