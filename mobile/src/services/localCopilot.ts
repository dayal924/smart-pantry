import { allCatalog, CatalogItem } from '../domain/catalog';
import { matchRecipes, nameOf, Recipe } from '../domain/recipeMatch';
import { daysLeft } from '../domain/shelfLife';
import type { PantryItem } from '../store/pantryStore';

/**
 * Generates an authentic, structured, high-quality recipe for a given produce item.
 * Fully compatible with parseRecipeFromText so "Add to My Recipes" appears.
 */
function createStructuredRecipe(item: { name: string; isFruit: boolean }): string {
  const name = item.name;
  if (item.isFruit) {
    if (name.toLowerCase().includes('banana')) {
      return (
        `**Recipe: Golden Banana Oat Pancakes**\n` +
        `Prep time: 15 mins | Servings: 2\n\n` +
        `Ingredients:\n` +
        `- 2 ripe Bananas, mashed\n` +
        `- 1 cup rolled oats\n` +
        `- 1/2 cup milk (or almond milk)\n` +
        `- 1 tbsp honey or maple syrup\n` +
        `- 1/2 tsp cinnamon and a pinch of salt\n` +
        `- 1 tsp butter or coconut oil for cooking\n\n` +
        `Instructions:\n` +
        `1. Peel and mash the ripe bananas in a bowl until smooth.\n` +
        `2. Stir in oats, milk, honey, cinnamon, and salt; let batter sit 2 minutes to thicken.\n` +
        `3. Heat butter in a non-stick skillet over medium heat.\n` +
        `4. Pour batter in 1/4 cup scoops. Cook for 2-3 minutes until bubbly, then flip and cook 2 minutes until golden.\n` +
        `5. Stack on a plate, drizzle with honey or fresh fruit, and serve warm!`
      );
    }
    if (name.toLowerCase().includes('apple')) {
      return (
        `**Recipe: Warm Spiced Apple Oatmeal Bowl**\n` +
        `Prep time: 12 mins | Servings: 2\n\n` +
        `Ingredients:\n` +
        `- 2 fresh Apples, diced into bite-sized cubes\n` +
        `- 1 cup rolled oats\n` +
        `- 1.5 cups milk or water\n` +
        `- 1 tbsp butter or coconut oil\n` +
        `- 1 tbsp honey or brown sugar\n` +
        `- 1/2 tsp cinnamon\n\n` +
        `Instructions:\n` +
        `1. In a small pot, simmer oats with milk over medium heat for 5 minutes until creamy.\n` +
        `2. In a skillet, melt butter over medium heat. Add diced apples, cinnamon, and honey.\n` +
        `3. Sauté apples for 4-5 minutes until tender and aromatic.\n` +
        `4. Spoon warm oatmeal into bowls, top generously with spiced apples, and enjoy!`
      );
    }
    if (name.toLowerCase().includes('mango')) {
      return (
        `**Recipe: Tropical Mango Chia Parfait**\n` +
        `Prep time: 10 mins | Servings: 2\n\n` +
        `Ingredients:\n` +
        `- 2 ripe Mangoes, peeled and diced\n` +
        `- 1 cup plain or Greek yogurt\n` +
        `- 2 tbsp chia seeds or granola\n` +
        `- 1 tbsp honey or lime juice\n\n` +
        `Instructions:\n` +
        `1. Dice one mango into chunks and blend the other into a smooth vibrant puree with honey.\n` +
        `2. In serving glasses, layer yogurt at the bottom.\n` +
        `3. Spoon the mango puree over yogurt, then top with diced fresh mango chunks.\n` +
        `4. Sprinkle with chia seeds or crunchy granola and serve chilled!`
      );
    }
    // Generic fruit
    return (
      `**Recipe: Fresh ${name} Breakfast Bowl**\n` +
      `Prep time: 10 mins | Servings: 2\n\n` +
      `Ingredients:\n` +
      `- 2 cups fresh ${name}, sliced\n` +
      `- 1 cup Greek yogurt or oatmeal\n` +
      `- 1 tbsp honey\n` +
      `- 2 tbsp crushed nuts or seeds\n\n` +
      `Instructions:\n` +
      `1. Wash and prepare the fresh ${name.toLowerCase()}.\n` +
      `2. Spoon yogurt or warm oatmeal into a bowl.\n` +
      `3. Arrange sliced ${name.toLowerCase()} nicely over top.\n` +
      `4. Drizzle with honey, sprinkle with nuts, and serve!`
    );
  }

  // Vegetables
  return (
    `**Recipe: Farmhouse Sautéed ${name} Skillet**\n` +
    `Prep time: 15 mins | Servings: 2\n\n` +
    `Ingredients:\n` +
    `- 2 fresh ${name}s, washed and sliced\n` +
    `- 1.5 tbsp olive oil or butter\n` +
    `- 2 cloves garlic, minced\n` +
    `- 1/2 tsp salt and freshly ground black pepper\n` +
    `- 1 pinch red chili flakes or fresh herbs\n\n` +
    `Instructions:\n` +
    `1. Wash and cut the ${name.toLowerCase()} into even, bite-sized pieces.\n` +
    `2. Heat olive oil in a skillet over medium heat. Sauté garlic for 30 seconds until fragrant.\n` +
    `3. Add sliced ${name.toLowerCase()} and cook for 7-9 minutes, tossing regularly until tender-crisp.\n` +
    `4. Season with salt, black pepper, and herbs to taste.\n` +
    `5. Transfer to a warm plate and serve as a vibrant side dish or with rice!`
  );
}

/** Offline rule-based copilot so the tab is always rich and useful even offline. */
export function localCopilot(msg: string, items: PantryItem[], recipes: Recipe[]): string {
  const m = msg.toLowerCase(),
    now = Date.now();
  const catalog = allCatalog();

  // 1. Storage tips
  if (/\b(store|keep|fridge|fresh|crisp|last|refrigerat)\b/i.test(m)) {
    const hit = catalog.find(
      (c) => m.includes(c.display.toLowerCase()) || m.includes(c.key.replace(/_/g, ' '))
    );
    if (hit) {
      return (
        `**${hit.emoji} ${hit.display} Storage Guide**\n\n` +
        `• **Room Temperature:** ~${hit.shelf_life_days.room} days\n` +
        `• **Refrigerator:** ~${hit.shelf_life_days.fridge} days\n\n` +
        `💡 **Pro Tip:** ${hit.tip}`
      );
    }
  }

  // 2. Expiration urgency
  if (/\b(expire|expiring|use first|urgent|soon|waste)\b/i.test(m)) {
    const u = items
      .map((i) => ({ i, d: daysLeft(i.expiresAt, now) }))
      .filter((x) => x.d <= 5)
      .sort((a, b) => a.d - b.d)
      .slice(0, 8);
    return u.length
      ? `**Items to use first (avoid waste):**\n\n` +
          u.map((x) => `• **${x.i.name}** – ${x.d < 0 ? 'expired' : x.d + ' day(s) left'}`).join('\n')
      : 'Nothing in your pantry is close to expiring right now! 🎉';
  }

  // 3. User asks for a recipe using specific ingredient(s) or "create recipe"
  if (
    /\b(recipe|cook|make|dish|bake|instructions|ingredients|prepare)\b/i.test(m) ||
    /\b(how to make|what can i make with|using:?)\b/i.test(m)
  ) {
    // Check if user mentioned any item in their pantry or catalog
    const mentionedFromCatalog = catalog.find(
      (c) => m.includes(c.display.toLowerCase()) || m.includes(c.key.replace(/_/g, ' '))
    );

    const active = items.filter((i) => i.status === 'active');
    const mentionedFromPantry = active.find(
      (i) =>
        m.includes(i.name.toLowerCase()) || m.includes(i.classKey.replace(/_/g, ' '))
    );

    if (mentionedFromCatalog || mentionedFromPantry) {
      const targetName = mentionedFromCatalog?.display ?? mentionedFromPantry!.name;
      const isFruit = [
        'apple',
        'banana',
        'mango',
        'orange',
        'strawberry',
        'grape',
        'pineapple',
        'watermelon',
        'peach',
        'pear',
        'kiwi',
        'cherry',
        'melon',
      ].some((f) => targetName.toLowerCase().includes(f));

      return createStructuredRecipe({ name: targetName, isFruit });
    }

    // If multiple active pantry items exist, generate a combined medley
    if (active.length > 0) {
      const topItems = active.slice(0, 2);
      const title = topItems.map((i) => i.name).join(' & ');
      return (
        `**Recipe: Fresh ${title} Harvest Medley**\n` +
        `Prep time: 15 mins | Servings: 2\n\n` +
        `Ingredients:\n` +
        topItems.map((i) => `- 1 ${i.name}`).join('\n') +
        `\n- 1 tbsp olive oil or butter\n` +
        `- 1 pinch sea salt and freshly cracked pepper\n\n` +
        `Instructions:\n` +
        `1. Wash and prepare the ${topItems.map((i) => i.name.toLowerCase()).join(' and ')}.\n` +
        `2. Warm a pan over medium heat with oil or butter.\n` +
        `3. Sauté ingredients for 6-8 minutes until tender and fragrant.\n` +
        `4. Season with salt and pepper to taste, and serve fresh!`
      );
    }
  }

  // 4. Pantry match recommendations
  const top = matchRecipes(items, now, recipes)
    .filter((r) => r.overlap > 0)
    .slice(0, 3);
  if (top.length) {
    return (
      `**Here are great recipes matched to your pantry:**\n\n` +
      top
        .map(
          (r) =>
            `• **${r.recipe.title}** (${r.overlap}% pantry match${
              r.missing.length ? ', need ' + r.missing.map(nameOf).join(', ') : ', ready to cook!'
            })`
        )
        .join('\n')
    );
  }

  return (
    `**I can help you with:**\n\n` +
    `• **Custom recipes:** e.g. "Tell me a recipe using Banana" or "How to cook Apple"\n` +
    `• **Pantry ideas:** "What should I cook tonight?"\n` +
    `• **Freshness tips:** "How do I store Tomatoes?"`
  );
}
