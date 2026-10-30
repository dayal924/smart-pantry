import { getCatalogItem, Nutrients, NUTRIENT_KEYS } from './catalog';
import type { PantryItem } from '../store/pantryStore';

export interface ProduceBenefitInfo {
  vitamins: string[];
  benefits: string[];
  tags: string[];
  highlight: string;
}

export const PRODUCE_BENEFITS: Record<string, ProduceBenefitInfo> = {
  apple: {
    vitamins: ['Vitamin C', 'Potassium', 'Pectin Fiber', 'Quercetin'],
    benefits: [
      'Prebiotic pectin fiber nourishes gut microbiota and aids digestion',
      'Quercetin flavonoid helps lower LDL cholesterol and blood pressure',
      'Slow-release carbs support steady energy and balanced blood sugar',
    ],
    tags: ['Gut Health', 'Heart Health', 'Weight Management'],
    highlight: 'Rich in soluble pectin fiber for gut microbiome and cardiovascular protection.',
  },
  banana: {
    vitamins: ['Potassium', 'Vitamin B6', 'Vitamin C', 'Magnesium'],
    benefits: [
      'High potassium balances electrolytes, reducing muscle cramps and fatigue',
      'Vitamin B6 assists in serotonin and dopamine production for mood support',
      'Resistant starch supports gut motility and smooth digestive transit',
    ],
    tags: ['Muscle Recovery', 'Energy', 'Heart Health'],
    highlight: 'Instant natural energy and potassium for electrolyte balance and heart rhythm.',
  },
  beetroot: {
    vitamins: ['Dietary Nitrates', 'Folate (B9)', 'Iron', 'Betalains'],
    benefits: [
      'Natural nitrates convert to nitric oxide, boosting blood circulation and stamina',
      'Betalain antioxidants support liver detoxification and cellular defense',
      'Folate and iron contribute to healthy red blood cell synthesis',
    ],
    tags: ['Stamina & Flow', 'Liver Detox', 'Heart Health'],
    highlight: 'Nitric oxide booster that enhances athletic endurance and blood oxygenation.',
  },
  bitter_gourd: {
    vitamins: ['Charantin', 'Vitamin C', 'Polypeptide-p', 'Zinc'],
    benefits: [
      'Charantin and polypeptide-p help regulate insulin response and glucose levels',
      'Rich in vitamin C and zinc to defend against seasonal cellular stress',
      'Traditional digestive stimulant that supports bile excretion',
    ],
    tags: ['Blood Sugar', 'Immunity', 'Metabolism'],
    highlight: 'Known for powerful bioactive peptides that assist glucose regulation.',
  },
  bottle_gourd: {
    vitamins: ['Water (96%)', 'Choline', 'Potassium', 'Dietary Fiber'],
    benefits: [
      'High natural water content provides deep cellular hydration with near-zero fat',
      'Choline content supports neural function and mental calm',
      'Gentle soluble fiber aids alkaline stomach balance and cooling digestion',
    ],
    tags: ['Deep Hydration', 'Digestive Calm', 'Weight Balance'],
    highlight: 'Ultra-hydrating, low-calorie vegetable that cools and purifies the digestive system.',
  },
  cabbage: {
    vitamins: ['Vitamin K', 'Vitamin C', 'Sulforaphane', 'Anthocyanins'],
    benefits: [
      'Vitamin K is essential for bone mineralization and healthy blood clotting',
      'Glucosinolates and sulforaphane activate natural cellular detox enzymes',
      'Glutamine amino acid helps soothe and heal gastric mucosal lining',
    ],
    tags: ['Gut Healing', 'Bone Health', 'Cellular Detox'],
    highlight: 'Cruciferous powerhouse packed with sulforaphane and Vitamin K for bone & gut renewal.',
  },
  capsicum: {
    vitamins: ['Vitamin C (160% DV)', 'Vitamin A', 'Capsanthin', 'Vitamin B6'],
    benefits: [
      'One of the richest dietary sources of Vitamin C, boosting collagen and immunity',
      'Capsanthin and carotenoids protect eyes against blue light and oxidative strain',
      'Low caloric density with high metabolic thermogenesis support',
    ],
    tags: ['Immunity Shield', 'Skin Collagen', 'Eye Defense'],
    highlight: 'Delivers more Vitamin C per gram than oranges, fostering radiant collagen production.',
  },
  carrot: {
    vitamins: ['Beta-Carotene (Vit A)', 'Lutein', 'Biotin', 'Fiber'],
    benefits: [
      'Beta-carotene converts to Vitamin A, protecting night vision and cornea health',
      'Biotin and antioxidants promote skin cell regeneration and radiant complexion',
      'Carotenoids strengthen mucosal immune barriers across respiratory and gut linings',
    ],
    tags: ['Vision & Eyes', 'Skin Glow', 'Immune Shield'],
    highlight: 'The ultimate vision food, rich in beta-carotene and lutein for sharp, healthy eyes.',
  },
  cauliflower: {
    vitamins: ['Choline', 'Vitamin C', 'Sulforaphane', 'Folate'],
    benefits: [
      'Choline is a critical precursor for brain neurotransmitters and memory',
      'High fiber keeps digestion efficient while maintaining very low carbs',
      'Glucosinolates help combat chronic systemic inflammation',
    ],
    tags: ['Brain Health', 'Low Carb', 'Anti-Inflammatory'],
    highlight: 'Rare plant source of essential choline for brain cognition and liver metabolism.',
  },
  cherry: {
    vitamins: ['Anthocyanins', 'Melatonin', 'Vitamin C', 'Potassium'],
    benefits: [
      'Natural food source of melatonin, supporting deeper, more restorative sleep',
      'Potent anthocyanins ease post-workout muscle soreness and joint stiffness',
      'Helps maintain balanced uric acid levels for joint comfort',
    ],
    tags: ['Restful Sleep', 'Joint Comfort', 'Muscle Recovery'],
    highlight: 'Nature’s sleep aid, containing natural melatonin and anti-inflammatory anthocyanins.',
  },
  chilli: {
    vitamins: ['Capsaicin', 'Vitamin C', 'Vitamin A', 'Bioflavonoids'],
    benefits: [
      'Capsaicin temporarily fires metabolic rate and promotes healthy lipid burning',
      'Endorphin trigger provides a natural mood boost and relief from minor discomfort',
      'Clears sinuses and upper respiratory passages during seasonal congestion',
    ],
    tags: ['Metabolism Boost', 'Mood Lifter', 'Sinus Relief'],
    highlight: 'Spicy capsaicin accelerates metabolism and releases uplifting endorphins.',
  },
  coconut: {
    vitamins: ['Medium-Chain Triglycerides (MCTs)', 'Manganese', 'Copper', 'Selenium'],
    benefits: [
      'MCT fats are absorbed directly by the liver for sustained mental and physical stamina',
      'Manganese supports essential bone metabolism and amino acid synthesis',
      'Lauric acid exhibits natural antimicrobial properties that support oral and gut flora',
    ],
    tags: ['Brain Fuel', 'Sustained Energy', 'Cellular Health'],
    highlight: 'Rich in clean MCT fatty acids that provide direct energy for brain and metabolism.',
  },
  cucumber: {
    vitamins: ['Silica', 'Hydrating Electrolytes', 'Vitamin K', 'Cucurbitacins'],
    benefits: [
      'Composed of 95% structured water, replenishing intracellular hydration',
      'Silica mineral encourages strong connective tissues, lustrous hair, and firm skin',
      'Cucurbitacins support anti-inflammatory pathways throughout the body',
    ],
    tags: ['Hydration', 'Skin Elasticity', 'Detox Cooling'],
    highlight: 'Rehydrates skin cells with mineralized water and silica for elasticity and glow.',
  },
  eggplant: {
    vitamins: ['Nasunin (Anthocyanin)', 'Chlorogenic Acid', 'Manganese', 'Fiber'],
    benefits: [
      'Nasunin in purple skin is a potent lipid-peroxidation inhibitor for brain membranes',
      'Chlorogenic acid assists in blood glucose stabilization and arterial flexibility',
      'Low calorie density aids dietary fullness without insulin spikes',
    ],
    tags: ['Brain Defense', 'Arterial Health', 'Weight Wellness'],
    highlight: 'Deep purple skin contains nasunin, a rare antioxidant that shields brain cell membranes.',
  },
  ginger: {
    vitamins: ['Gingerols', 'Shogaols', 'Potassium', 'Manganese'],
    benefits: [
      'Gingerols actively soothe gastric irritation, nausea, and motion discomfort',
      'Powerful systemic anti-inflammatory that helps relieve joint stiffness',
      'Promotes circulatory warmth and peripheral blood circulation',
    ],
    tags: ['Digestive Comfort', 'Anti-Nausea', 'Immune Fire'],
    highlight: 'Ancient medicinal root with gingerols that instantly calm digestive and immune distress.',
  },
  grape: {
    vitamins: ['Resveratrol', 'Vitamin K', 'Copper', 'Flavonols'],
    benefits: [
      'Resveratrol stimulates cellular longevity sirtuin pathways and endothelial health',
      'Supports microcirculation in blood vessels, fostering arterial elasticity',
      'Natural polyphenols reduce oxidative stress on cognitive function',
    ],
    tags: ['Longevity', 'Heart & Arteries', 'Cognition'],
    highlight: 'Packed with resveratrol and polyphenols that promote youthful vascular elasticity.',
  },
  green_orange: {
    vitamins: ['Vitamin C', 'Hesperidin', 'Citric Acid', 'Potassium'],
    benefits: [
      'High citric acid enhances dietary iron bioavailability from grains and legumes',
      'Hesperidin bioflavonoid protects venous tone and reduces capillary fragility',
      'Invigorates hydration balance and alkalizes biological fluids',
    ],
    tags: ['Immune Shield', 'Iron Absorption', 'Circulation'],
    highlight: 'Tangy citrus loaded with bioflavonoids to optimize iron absorption and venous health.',
  },
  kiwi: {
    vitamins: ['Actinidin Enzyme', 'Vitamin C (130% DV)', 'Vitamin E', 'Fiber'],
    benefits: [
      'Actinidin proteolytic enzyme accelerates gastrointestinal protein breakdown',
      'Delivers dual antioxidant protection with rare pairing of Vitamin C and Vitamin E',
      'Studies show eating 2 kiwis in the evening enhances sleep onset and duration',
    ],
    tags: ['Protein Digestion', 'Sleep Quality', 'Antioxidant Shield'],
    highlight: 'Actinidin enzyme supercharges digestion while high Vitamin C & E shield cells.',
  },
  maize: {
    vitamins: ['Lutein & Zeaxanthin', 'Vitamin B1 (Thiamine)', 'Phosphorus', 'Insoluble Fiber'],
    benefits: [
      'Dense in macular carotenoids that accumulate in retina to filter damaging blue rays',
      'Thiamine acts as a crucial coenzyme for energy transformation from carbohydrates',
      'Fiber content promotes healthy intestinal bulk and regular elimination',
    ],
    tags: ['Macular Eye Health', 'Energy Coenzyme', 'Digestive Rhythm'],
    highlight: 'Abundant in lutein and zeaxanthin that shield eyes against modern screen strain.',
  },
  mango: {
    vitamins: ['Vitamin A', 'Mangiferin', 'Vitamin C', 'Amylase Enzymes'],
    benefits: [
      'Amylase digestive enzymes break down complex starches into clean energy',
      'Mangiferin is clinically recognized as a "super-antioxidant" for cardiac tissue',
      'High Vitamin A and C maintain glowing dermal barrier and immune resilience',
    ],
    tags: ['Digestive Enzymes', 'Heart Defender', 'Radiant Skin'],
    highlight: 'The king of fruits, supplying mangiferin and natural digestive enzymes for vitality.',
  },
  melon: {
    vitamins: ['Electrolytes', 'Citrulline', 'Vitamin C', 'Beta-Carotene'],
    benefits: [
      'Citrulline amino acid improves blood vessel dilation and athletic recovery',
      'Replenishes essential sodium-potassium balance after hot days or exercise',
      'Gentle sweetness with minimal digestive burden for quick cellular revitalization',
    ],
    tags: ['Recovery', 'Electrolyte Balance', 'Gentle Digestion'],
    highlight: 'Cooling, electrolyte-rich fruit that optimizes hydration and muscle recovery.',
  },
  okra: {
    vitamins: ['Mucilage Fiber', 'Folate', 'Vitamin K', 'Polyphenols'],
    benefits: [
      'High soluble mucilage coats the GI tract, soothing irritation and acid reflux',
      'Binds to bile acids to facilitate cholesterol clearance from the body',
      'Helps slow down digestive carbohydrate absorption, buffering insulin spikes',
    ],
    tags: ['Gut Soothing', 'Cholesterol Care', 'Glucose Stability'],
    highlight: 'Natural mucilage fiber coats and heals the digestive tract while clearing cholesterol.',
  },
  onion: {
    vitamins: ['Quercetin', 'Organosulfur Compounds', 'Chromium', 'Prebiotics'],
    benefits: [
      'High inulin prebiotic fiber feeds beneficial Bifidobacteria in the microbiome',
      'Quercetin acts as a natural antihistamine and anti-inflammatory protector',
      'Organosulfur compounds promote vascular health and healthy lipid balance',
    ],
    tags: ['Prebiotic Power', 'Allergy Defense', 'Vascular Tone'],
    highlight: 'Prebiotic goldmine rich in quercetin that feeds healthy gut bacteria and calms inflammation.',
  },
  orange: {
    vitamins: ['Vitamin C (100% DV)', 'Hesperidin', 'Folate', 'Thiamine'],
    benefits: [
      'Classic immune defender boosting white blood cell activity and collagen integrity',
      'Hesperidin helps maintain supple, flexible arteries and normal blood pressure',
      'Dietary folate supports cellular division, repair, and vital energy production',
    ],
    tags: ['Immunity Champion', 'Vascular Suppleness', 'Collagen Glow'],
    highlight: 'Immunity gold standard packed with bioflavonoids and pure Vitamin C for whole-body defense.',
  },
  peach: {
    vitamins: ['Vitamin C', 'Chlorogenic Acid', 'Beta-Carotene', 'Potassium'],
    benefits: [
      'Natural polyphenols help neutralize oxidative stress in dermal tissues',
      'Gentle soluble and insoluble fiber blend prevents digestive sluggishness',
      'Mild natural diuretic effect that assists the body in balancing fluid retention',
    ],
    tags: ['Skin Hydration', 'Fluid Balance', 'Gentle Digestion'],
    highlight: 'Juicy summer fruit offering dermal antioxidants and gentle fluid balance support.',
  },
  pear: {
    vitamins: ['Pectin (6g Fiber)', 'Copper', 'Vitamin K', 'Flavonoids'],
    benefits: [
      'One of the highest-fiber fruits (nearly 25% of daily fiber in a single pear!)',
      'Copper is a vital trace mineral for immune signaling and nerve myelin health',
      'Hypoallergenic fruit gentle on the most sensitive digestive systems',
    ],
    tags: ['Super Fiber', 'Gentle Digestion', 'Immune Trace Minerals'],
    highlight: 'Delivers 6 grams of prebiotic fiber to optimize digestive regularity and satiety.',
  },
  peas: {
    vitamins: ['Plant Protein', 'Iron', 'Vitamin K', 'B-Complex Vitamins'],
    benefits: [
      'Packed with plant-based amino acids that support lean muscle maintenance',
      'Contains non-heme iron and Vitamin C together, ensuring high mineral absorption',
      'Saponins and polyphenols provide steady metabolic antioxidant protection',
    ],
    tags: ['Plant Protein', 'Iron Power', 'Muscle Fuel'],
    highlight: 'Remarkable source of clean plant protein and iron for steady metabolic stamina.',
  },
  pineapple: {
    vitamins: ['Bromelain Enzyme', 'Vitamin C (130% DV)', 'Manganese', 'Thiamine'],
    benefits: [
      'Bromelain proteolytic enzyme digests tough proteins and reduces post-injury swelling',
      'Manganese is a required cofactor for antioxidant superoxide dismutase (SOD)',
      'Natural enzyme properties support sinus clarity and tissue healing',
    ],
    tags: ['Enzyme Digestion', 'Anti-Swelling', 'Tissue Recovery'],
    highlight: 'Bromelain enzyme breaks down proteins, soothes joints, and accelerates physical recovery.',
  },
  pomegranate: {
    vitamins: ['Punicalagins', 'Punicic Acid', 'Vitamin C', 'Vitamin K'],
    benefits: [
      'Punicalagins provide 3x the antioxidant activity of red wine or green tea',
      'Supports healthy endothelial nitric oxide synthesis for robust arterial flow',
      'Shields brain and memory circuits from age-related oxidative degradation',
    ],
    tags: ['Cardiovascular Elite', 'Microbiome Fuel', 'Memory Defense'],
    highlight: 'Elite longevity fruit loaded with punicalagins that protect arteries and brain health.',
  },
  potato: {
    vitamins: ['Potassium (more than bananas!)', 'Resistant Starch', 'Vitamin C', 'Vitamin B6'],
    benefits: [
      'Contains more potassium than a banana, essential for blood pressure regulation',
      'Cooled cooked potatoes form resistant starch that acts as pure prebiotic food for colon',
      'Vitamin B6 supports amino acid metabolism and neurotransmitter balance',
    ],
    tags: ['Electrolyte Power', 'Prebiotic Colon', 'Sustained Satiety'],
    highlight: 'Potassium heavyweight with resistant starch that nourishes colon cells and balances pressure.',
  },
  radish: {
    vitamins: ['Glucosinolates', 'Anthocyanins', 'Vitamin C', 'Zinc'],
    benefits: [
      'Natural pungent isothiocyanates stimulate bile flow and liver filtration',
      'Crisp hydration with near-zero glycemic impact for light, clean digestion',
      'Assists in thinning mucous and clearing throat and sinus congestion',
    ],
    tags: ['Liver Cleansing', 'Bile Flow', 'Sinus Clarity'],
    highlight: 'Crisp root vegetable with pungent isothiocyanates that promote natural liver and bile detox.',
  },
  strawberry: {
    vitamins: ['Ellagic Acid', 'Vitamin C (100% DV)', 'Folate', 'Manganese'],
    benefits: [
      'Ellagic acid and pelargonidin anthocyanins protect vascular endothelium',
      'Abundant Vitamin C accelerates skin collagen regeneration and UV resilience',
      'Low glycemic index with high polyphenols prevents blood sugar spikes',
    ],
    tags: ['Collagen Boost', 'Endothelial Health', 'Low Glycemic'],
    highlight: 'Antioxidant jewel brimming with ellagic acid and Vitamin C for radiant collagen support.',
  },
  tomato: {
    vitamins: ['Lycopene', 'Vitamin C', 'Potassium', 'Beta-Carotene'],
    benefits: [
      'Lycopene is a world-class carotenoid known for arterial and prostate defense',
      'Cooking tomatoes with healthy olive oil multiplies lycopene bioavailability',
      'Potassium and folate support healthy heart rhythm and homocysteine balance',
    ],
    tags: ['Heart Protection', 'Cellular Defense', 'Prostate Care'],
    highlight: 'Supreme source of lycopene, protecting arteries, prostate, and skin from oxidative wear.',
  },
  turnip: {
    vitamins: ['Glucosinolates', 'Vitamin C', 'Calcium', 'Dietary Fiber'],
    benefits: [
      'Cruciferous sulfur compounds facilitate Phase-2 liver detoxification pathways',
      'Provides surprising plant-based calcium for bone and dental mineralization',
      'Low-calorie root that promotes deep satiety without heavy starch burden',
    ],
    tags: ['Bone Support', 'Phase-2 Detox', 'Light Satiety'],
    highlight: 'Cruciferous root vegetable with bone-supportive calcium and liver-clearing glucosinolates.',
  },
  watermelon: {
    vitamins: ['Citrulline', 'Lycopene', 'Hydrating Water (92%)', 'Potassium'],
    benefits: [
      'Citrulline amino acid fuels nitric oxide for muscle recovery and vessel relaxation',
      'More lycopene per serving than fresh tomatoes, combating cellular oxidative stress',
      'Deep cellular rehydration that refreshes tired muscles after heat and exertion',
    ],
    tags: ['Muscle Recovery', 'Vascular Relaxation', 'Deep Hydration'],
    highlight: 'Ultimate thirst quencher packed with citrulline and lycopene for arterial and muscle recovery.',
  },
};

const DEFAULT_BENEFITS: ProduceBenefitInfo = {
  vitamins: ['Essential Vitamins', 'Dietary Fiber', 'Antioxidants', 'Potassium'],
  benefits: [
    'Provides dietary fiber that assists gut motility and sustained fullness',
    'Supplies plant antioxidants that defend cells against daily oxidative stress',
    'Supports optimal metabolic balance and cellular energy production',
  ],
  tags: ['Vitality', 'Digestive Health', 'Antioxidants'],
  highlight: 'Fresh, nutrient-dense produce that nourishes vitality and daily wellness.',
};

export function getProduceBenefits(classKey: string): ProduceBenefitInfo {
  const k = classKey.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return PRODUCE_BENEFITS[k] ?? DEFAULT_BENEFITS;
}

export interface PantryNutritionSummary {
  totalItems: number;
  totalGrams: number;
  nutrients: Nutrients;
  dailyTargetPct: {
    kcal: number;
    vitamin_c_mg: number;
    fiber_g: number;
    protein_g: number;
    carbs_g: number;
  };
  unlockedSuperpowers: {
    icon: string;
    title: string;
    description: string;
    sources: string[];
  }[];
}

/**
 * Calculates aggregate nutritional inventory stored in active pantry items.
 */
export function calculatePantryNutrition(
  activePantry: PantryItem[],
  targets: Nutrients = { kcal: 2000, carbs_g: 250, fiber_g: 28, vitamin_c_mg: 90, protein_g: 50 }
): PantryNutritionSummary {
  let totalGrams = 0;
  const totals: Nutrients = {
    kcal: 0,
    carbs_g: 0,
    fiber_g: 0,
    vitamin_c_mg: 0,
    protein_g: 0,
  };

  const tagCounts: Record<string, string[]> = {};

  for (const item of activePantry) {
    const cat = getCatalogItem(item.classKey);
    const itemGrams = (item.quantity ?? 1) * cat.grams_per_item;
    totalGrams += itemGrams;

    const n100 = cat.nutrition_per_100g;
    totals.kcal += (n100.kcal * itemGrams) / 100;
    totals.carbs_g += (n100.carbs_g * itemGrams) / 100;
    totals.fiber_g += (n100.fiber_g * itemGrams) / 100;
    totals.vitamin_c_mg += (n100.vitamin_c_mg * itemGrams) / 100;
    totals.protein_g += (n100.protein_g * itemGrams) / 100;

    const info = getProduceBenefits(item.classKey);
    for (const tag of info.tags) {
      if (!tagCounts[tag]) tagCounts[tag] = [];
      if (!tagCounts[tag].includes(cat.display)) {
        tagCounts[tag].push(cat.display);
      }
    }
  }

  // Round values
  for (const k of NUTRIENT_KEYS) {
    totals[k] = Math.round(totals[k] * 10) / 10;
  }

  // Calculate percentage of daily targets
  const dailyTargetPct = {
    kcal: Math.min(200, Math.round((totals.kcal / (targets.kcal || 2000)) * 100)),
    vitamin_c_mg: Math.min(500, Math.round((totals.vitamin_c_mg / (targets.vitamin_c_mg || 90)) * 100)),
    fiber_g: Math.min(300, Math.round((totals.fiber_g / (targets.fiber_g || 28)) * 100)),
    protein_g: Math.min(200, Math.round((totals.protein_g / (targets.protein_g || 50)) * 100)),
    carbs_g: Math.min(200, Math.round((totals.carbs_g / (targets.carbs_g || 250)) * 100)),
  };

  // Build unlocked superpowers based on current pantry items
  const superpowers = [];

  if (totals.vitamin_c_mg >= 30 || tagCounts['Immunity Shield'] || tagCounts['Immunity Champion']) {
    const sources = (tagCounts['Immunity Shield'] || tagCounts['Immunity Champion'] || Object.values(tagCounts)[0] || []).slice(0, 3);
    superpowers.push({
      icon: '🛡️',
      title: 'Immune Shield & Collagen',
      description: `${totals.vitamin_c_mg}mg Vitamin C banked (${dailyTargetPct.vitamin_c_mg}% of daily target).`,
      sources,
    });
  }

  if (totals.fiber_g >= 8 || tagCounts['Gut Health'] || tagCounts['Gut Healing']) {
    const sources = (tagCounts['Gut Health'] || tagCounts['Gut Healing'] || tagCounts['Super Fiber'] || []).slice(0, 3);
    superpowers.push({
      icon: '🌾',
      title: 'Gut Microbiome & Digestion',
      description: `${totals.fiber_g}g dietary fiber (${dailyTargetPct.fiber_g}% daily intake) fueling healthy digestion.`,
      sources,
    });
  }

  if (tagCounts['Vision & Eyes'] || tagCounts['Eye Defense']) {
    const sources = (tagCounts['Vision & Eyes'] || tagCounts['Eye Defense'] || []).slice(0, 3);
    superpowers.push({
      icon: '👁️',
      title: 'Vision & Macular Defense',
      description: 'Rich in Beta-Carotene & Lutein to protect retinas and boost skin radiance.',
      sources,
    });
  }

  if (tagCounts['Heart Health'] || tagCounts['Cardiovascular Elite'] || tagCounts['Heart Protection']) {
    const sources = (tagCounts['Heart Health'] || tagCounts['Cardiovascular Elite'] || tagCounts['Heart Protection'] || []).slice(0, 3);
    superpowers.push({
      icon: '❤️',
      title: 'Heart & Vascular Tone',
      description: 'Lycopene, Nitrates, and Polyphenols defending arterial flexibility.',
      sources,
    });
  }

  if (tagCounts['Muscle Recovery'] || tagCounts['Energy']) {
    const sources = (tagCounts['Muscle Recovery'] || tagCounts['Energy'] || []).slice(0, 3);
    superpowers.push({
      icon: '⚡',
      title: 'Vitality & Electrolytes',
      description: 'Potassium and clean natural carbs powering stamina and muscle recovery.',
      sources,
    });
  }

  // Fallback superpower if pantry is small
  if (superpowers.length === 0 && activePantry.length > 0) {
    superpowers.push({
      icon: '🥗',
      title: 'Fresh Vitality',
      description: `${totals.kcal} kcal of clean, unprocessed whole foods stored in your pantry.`,
      sources: activePantry.slice(0, 3).map((i) => i.name),
    });
  }

  return {
    totalItems: activePantry.length,
    totalGrams: Math.round(totalGrams),
    nutrients: totals,
    dailyTargetPct,
    unlockedSuperpowers: superpowers,
  };
}

