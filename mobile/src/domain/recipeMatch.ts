import recipesJson from '../data/recipes.json';
import { allCatalog, getCatalogItem, normalizeKey } from './catalog';
import { urgencyOf } from './shelfLife';

export interface Recipe {
  id: string; title: string; time_min: number; servings: number;
  ingredients: { key: string; grams: number; optional: boolean }[];
  staples: string[]; steps: string[];
}
export interface RecipeMatch {
  recipe: Recipe; overlap: number; rankScore: number;
  have: string[]; missing: string[]; urgentNow: string[]; urgentSoon: string[];
}
export const BUNDLED_RECIPES = recipesJson as Recipe[];

/** Mirrors backend/app/services/recipes.py match_recipes(); expired batches don't count as "in stock". */
export function matchRecipes(
  pantry: { classKey: string; expiresAt: number }[], now: number, recipes: Recipe[] = BUNDLED_RECIPES,
): RecipeMatch[] {
  const rank = { use_now: 0, use_soon: 1, fresh_later: 2 } as const;
  const stock = new Map<string, keyof typeof rank>();
  for (const p of pantry) {
    const u = urgencyOf(p.expiresAt, now);
    if (u === 'expired') continue;
    const k = normalizeKey(p.classKey);
    const cur = stock.get(k);
    if (cur === undefined || rank[u] < rank[cur]) stock.set(k, u);
  }
  const out: RecipeMatch[] = [];
  for (const r of recipes) {
    const req = r.ingredients.filter((i) => !i.optional);
    if (!req.length) continue;
    const have = req.filter((i) => stock.has(i.key)).map((i) => i.key);
    const missing = req.filter((i) => !stock.has(i.key)).map((i) => i.key);
    const optHave = r.ingredients.filter((i) => i.optional && stock.has(i.key)).map((i) => i.key);
    const overlap = Math.round((100 * have.length) / req.length);
    const urgentNow = [...have, ...optHave].filter((k) => stock.get(k) === 'use_now');
    const urgentSoon = [...have, ...optHave].filter((k) => stock.get(k) === 'use_soon');
    const boost = Math.min(30, 12 * urgentNow.length + 6 * urgentSoon.length);
    out.push({ recipe: r, overlap, rankScore: overlap + (have.length ? boost : 0), have, missing, urgentNow, urgentSoon });
  }
  out.sort((a, b) => b.rankScore - a.rankScore || b.overlap - a.overlap || a.recipe.time_min - b.recipe.time_min);
  return out;
}
export const nameOf = (k: string) => getCatalogItem(k).display;

export function parseRecipeFromText(text: string): Recipe | null {
  if (!text) return null;

  // 1. Title matching
  let title = '';
  const titleMatch =
    text.match(/(?:\*\*|#+)?\s*(?:Recipe|Dish):\s*([^\n\r*#]+)/i) ||
    text.match(/\*\*([A-Za-z0-9\s-]{4,40}(?:Salad|Soup|Stir[\s-]?Fry|Smoothie|Bowl|Curry|Bake|Roast|Medley|Sauté|Dish|Plate|Recipe|Pasta|Rice|Wrap))\*\*/i) ||
    text.match(/^#+\s*([^\n\r]+)/m);

  if (titleMatch) {
    title = titleMatch[1].trim().replace(/^[*#_\s]+|[*#_\s]+$/g, '');
  }

  // 2. Prep time & Servings
  let timeMin = 15;
  const timeMatch = text.match(/(?:Prep\s+)?Time:\s*(\d+)/i) || text.match(/(\d+)\s*(?:mins?|minutes)/i);
  if (timeMatch) timeMin = parseInt(timeMatch[1], 10) || 15;

  let servings = 2;
  const servingsMatch = text.match(/Servings?:\s*(\d+)/i) || text.match(/Serves\s*(\d+)/i);
  if (servingsMatch) servings = parseInt(servingsMatch[1], 10) || 2;

  // 3. Ingredients section
  const ingSectionMatch = text.match(/(?:Ingredients|What you need):?\s*\n([\s\S]*?)(?=(?:Instructions|Directions|Steps|Method|$))/i);
  if (!ingSectionMatch) return null;

  const ingLines = ingSectionMatch[1]
    .split('\n')
    .map((l) => l.trim().replace(/^[-*•\d.)\s]+/, '').trim())
    .filter((l) => l.length > 2);

  if (!ingLines.length) return null;

  const catalog = allCatalog();
  const ingredients: { key: string; grams: number; optional: boolean }[] = [];
  const staples: string[] = [];

  for (const line of ingLines) {
    const lower = line.toLowerCase();
    const hit = catalog.find((c) =>
      lower.includes(c.display.toLowerCase()) ||
      lower.includes(c.key.replace(/_/g, ' ')) ||
      lower.includes(c.key)
    );

    if (hit) {
      const gramsMatch = line.match(/(\d+)\s*g(?:rams)?\b/i);
      const countMatch = line.match(/^(\d+(?:\.\d+)?)/);
      let grams = hit.grams_per_item;
      if (gramsMatch) {
        grams = parseInt(gramsMatch[1], 10);
      } else if (countMatch) {
        grams = parseFloat(countMatch[1]) * hit.grams_per_item;
      }
      ingredients.push({
        key: hit.key,
        grams: Math.round(grams),
        optional: false,
      });
    } else {
      staples.push(line);
    }
  }

  // 4. Instructions section
  const stepsSectionMatch = text.match(/(?:Instructions|Directions|Steps|Method):?\s*\n([\s\S]*)/i);
  if (!stepsSectionMatch) return null;

  const steps = stepsSectionMatch[1]
    .split('\n')
    .map((l) => l.trim().replace(/^[-*•\d.)\s]+/, '').trim())
    .filter((l) => l.length > 4 && !/^(Enjoy|Tip|Note|Prep time|Servings)/i.test(l));

  if (!steps.length) return null;
  if (!title) title = 'Custom Pantry Recipe';

  const id = `copilot_${title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 20)}_${Date.now().toString(36)}`;

  return {
    id,
    title,
    time_min: timeMin,
    servings,
    ingredients: ingredients.length ? ingredients : [{ key: 'apple', grams: 180, optional: false }],
    staples: staples.slice(0, 6),
    steps,
  };
}
