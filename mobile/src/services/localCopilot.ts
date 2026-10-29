import { allCatalog } from '../domain/catalog';
import { matchRecipes, nameOf } from '../domain/recipeMatch';
import { daysLeft } from '../domain/shelfLife';
import type { Recipe } from '../domain/recipeMatch';
import type { PantryItem } from '../store/pantryStore';

/** Offline rule-based copilot so the tab is still useful with no connection. */
export function localCopilot(msg: string, items: PantryItem[], recipes: Recipe[]): string {
  const m = msg.toLowerCase(), now = Date.now();
  if (/\b(store|keep|fridge|fresh|crisp|last|refrigerat)/.test(m)) {
    const hit = allCatalog().find((c) => m.includes(c.display.toLowerCase()) || m.includes(c.key.replace(/_/g, ' ')));
    if (hit) return `${hit.emoji} ${hit.display}: about ${hit.shelf_life_days.room} days at room temperature, ${hit.shelf_life_days.fridge} in the fridge. ${hit.tip}`;
  }
  if (/\b(expire|expiring|use first|urgent|soon|waste)/.test(m)) {
    const u = items.map((i) => ({ i, d: daysLeft(i.expiresAt, now) })).filter((x) => x.d <= 5).sort((a, b) => a.d - b.d).slice(0, 8);
    return u.length ? 'Use these first:\n' + u.map((x) => `• ${x.i.name} - ${x.d < 0 ? 'expired' : x.d + ' day(s) left'}`).join('\n') : 'Nothing is close to expiring. 🎉';
  }
  if (/\b(create|generate|write|make new|custom|recipe with)\b/i.test(m) || (/\b(recipe|cook|make)\b/i.test(m) && items.length > 0)) {
    const active = items.filter((i) => i.status === 'active');
    const mentioned = active.filter((i) => m.includes(i.name.toLowerCase()) || m.includes(i.classKey.replace(/_/g, ' ')));
    const chosen = (mentioned.length > 0 ? mentioned : active).slice(0, 3);
    if (chosen.length > 0) {
      const title = chosen.map((c) => c.name).join(' & ') + ' Medley';
      return `**Recipe: Fresh ${title}**\n` +
        `Prep time: 15 mins | Servings: 2\n` +
        `Ingredients:\n` +
        chosen.map((c) => `- 1 ${c.name}`).join('\n') + `\n- 1 tbsp olive oil, pinch of salt and pepper\n` +
        `Instructions:\n` +
        `1. Wash and prepare the ${chosen.map((c) => c.name.toLowerCase()).join(' and ')}.\n` +
        `2. Warm a skillet over medium heat with olive oil.\n` +
        `3. Sauté ingredients for 8-10 minutes until aromatic and tender.\n` +
        `4. Season with salt and pepper to taste, serve warm and enjoy!`;
    }
  }
  if (/\b(cook|dinner|lunch|recipe|make|tonight|meal|eat)/.test(m)) {
    const top = matchRecipes(items, now, recipes).filter((r) => r.overlap > 0).slice(0, 3);
    return top.length ? 'You can cook:\n' + top.map((r) => `• ${r.recipe.title} (${r.overlap}% match${r.missing.length ? ', need ' + r.missing.map(nameOf).join(', ') : ''})`).join('\n') : 'Scan a few more items first.';
  }
  return "I'm offline, so I can only help with: what to cook, what to use first, and storage tips (e.g. “how do I store tomatoes?”).";
}
