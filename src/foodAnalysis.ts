export interface FoodAnalysis {
  healthy: boolean;
  score: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  feedback: string;
  foodName: string;
  benefits: string[];
  positives: string[];
  negatives: string[];
  suggestions: string[];
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'fruit' | 'dessert';

export const MEAL_TYPE_LABELS: Record<MealType, { label: string; emoji: string; desc: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🍳', desc: 'Start the day with energy' },
  lunch: { label: 'Lunch', emoji: '🥗', desc: 'Balanced midday fuel' },
  dinner: { label: 'Dinner', emoji: '🍽️', desc: 'Lighter evening meal' },
  snack: { label: 'Snack', emoji: '🥨', desc: 'Small bite between meals' },
  fruit: { label: 'Fruit', emoji: '🍎', desc: 'Fresh and natural' },
  dessert: { label: 'Dessert', emoji: '🍰', desc: 'A sweet treat' },
};

interface FoodEntry {
  keywords: string[];
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  healthy: boolean;
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'fast' | 'snack' | 'drink' | 'dessert';
  benefits: string[];
  suitableMeals: MealType[];
}

const FOOD_DB: FoodEntry[] = [
  { keywords: ['chicken', 'grilled', 'breast'], name: 'Chicken', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, healthy: true, category: 'protein', benefits: ['High in lean protein for muscle repair', 'Rich in B vitamins for energy', 'Supports immune function'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['salmon', 'fish'], name: 'Salmon', calories: 208, protein: 22, carbs: 0, fat: 13, fiber: 0, healthy: true, category: 'protein', benefits: ['Rich in omega-3 fatty acids for heart health', 'Excellent protein source', 'Reduces inflammation'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['beef', 'steak'], name: 'Beef', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, healthy: false, category: 'protein', benefits: ['High in iron and B12', 'Supports muscle growth'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['egg', 'omelette', 'omelet', 'scrambled'], name: 'Eggs', calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, healthy: true, category: 'protein', benefits: ['Complete protein with all amino acids', 'Rich in choline for brain health', 'Keeps you full longer'], suitableMeals: ['breakfast', 'snack'] },
  { keywords: ['tofu', 'tempeh'], name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, healthy: true, category: 'protein', benefits: ['Plant-based complete protein', 'Rich in calcium', 'Low in calories'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['bean', 'lentil', 'chickpea'], name: 'Beans', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 6, healthy: true, category: 'protein', benefits: ['High in fiber for digestion', 'Stabilizes blood sugar', 'Good plant protein'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['rice', 'quinoa'], name: 'Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, healthy: true, category: 'grain', benefits: ['Quick energy from carbohydrates', 'Easy to digest', 'Gluten-free'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['pasta', 'noodle', 'spaghetti'], name: 'Pasta', calories: 158, protein: 5.8, carbs: 31, fat: 0.9, fiber: 1.8, healthy: false, category: 'grain', benefits: ['Good carbohydrate energy source'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['bread', 'toast', 'sandwich'], name: 'Bread', calories: 80, protein: 3, carbs: 14, fat: 1, fiber: 1, healthy: false, category: 'grain', benefits: ['Quick carbohydrate energy'], suitableMeals: ['breakfast', 'snack'] },
  { keywords: ['oat', 'oatmeal', 'porridge'], name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, healthy: true, category: 'grain', benefits: ['Lowers cholesterol', 'Sustained energy release', 'High in soluble fiber'], suitableMeals: ['breakfast'] },
  { keywords: ['salad', 'vegetable', 'veg', 'greens', 'spinach', 'kale', 'lettuce'], name: 'Salad', calories: 30, protein: 1, carbs: 6, fat: 0.3, fiber: 2, healthy: true, category: 'vegetable', benefits: ['Packed with vitamins and minerals', 'Low calories, high volume', 'Supports hydration and digestion'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['broccoli'], name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, healthy: true, category: 'vegetable', benefits: ['Rich in vitamin C and K', 'Contains cancer-fighting compounds', 'High in fiber'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['potato', 'fries', 'chips'], name: 'Potato', calories: 365, protein: 4, carbs: 83, fat: 0.1, fiber: 2, healthy: false, category: 'fast', benefits: ['Good potassium source'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['pizza'], name: 'Pizza', calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2, healthy: false, category: 'fast', benefits: ['Contains calcium from cheese'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['burger', 'hamburger'], name: 'Burger', calories: 295, protein: 17, carbs: 24, fat: 14, fiber: 1, healthy: false, category: 'fast', benefits: ['High protein content'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['apple'], name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, healthy: true, category: 'fruit', benefits: ['Rich in antioxidants', 'Supports heart health', 'High in pectin fiber'], suitableMeals: ['fruit', 'snack', 'breakfast'] },
  { keywords: ['banana'], name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, healthy: true, category: 'fruit', benefits: ['Great potassium source', 'Quick natural energy', 'Supports muscle function'], suitableMeals: ['fruit', 'snack', 'breakfast'] },
  { keywords: ['berry', 'berries', 'strawberry', 'blueberry'], name: 'Berries', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 3, healthy: true, category: 'fruit', benefits: ['Loaded with antioxidants', 'Anti-inflammatory', 'Supports brain health'], suitableMeals: ['fruit', 'snack', 'breakfast'] },
  { keywords: ['orange'], name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, healthy: true, category: 'fruit', benefits: ['High in vitamin C', 'Boosts immune system', 'Supports collagen production'], suitableMeals: ['fruit', 'snack'] },
  { keywords: ['avocado'], name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, healthy: true, category: 'fruit', benefits: ['Healthy monounsaturated fats', 'Supports heart health', 'High in fiber and potassium'], suitableMeals: ['breakfast', 'lunch', 'dinner', 'snack'] },
  { keywords: ['yogurt', 'greek yogurt'], name: 'Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, healthy: true, category: 'dairy', benefits: ['Probiotics for gut health', 'High in protein', 'Rich in calcium'], suitableMeals: ['breakfast', 'snack'] },
  { keywords: ['cheese'], name: 'Cheese', calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0, healthy: false, category: 'dairy', benefits: ['Good calcium source', 'High in protein'], suitableMeals: ['snack', 'lunch', 'dinner'] },
  { keywords: ['milk'], name: 'Milk', calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, healthy: true, category: 'dairy', benefits: ['Calcium for bones', 'Vitamin D source', 'Quality protein'], suitableMeals: ['breakfast', 'snack'] },
  { keywords: ['water'], name: 'Water', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, healthy: true, category: 'drink', benefits: ['Essential for hydration', 'Supports all body functions'], suitableMeals: ['breakfast', 'lunch', 'dinner', 'snack', 'fruit', 'dessert'] },
  { keywords: ['juice', 'soda', 'cola', 'soft drink'], name: 'Sugary Drink', calories: 110, protein: 0, carbs: 28, fat: 0, fiber: 0, healthy: false, category: 'drink', benefits: ['Quick hydration'], suitableMeals: ['snack'] },
  { keywords: ['coffee', 'tea'], name: 'Coffee/Tea', calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, healthy: true, category: 'drink', benefits: ['Antioxidants', 'May improve focus', 'Mild caffeine boost'], suitableMeals: ['breakfast', 'snack'] },
  { keywords: ['chocolate', 'cake', 'cookie', 'ice cream', 'donut', 'candy'], name: 'Dessert', calories: 200, protein: 2, carbs: 30, fat: 10, fiber: 1, healthy: false, category: 'dessert', benefits: ['Can boost mood in moderation'], suitableMeals: ['dessert'] },
  { keywords: ['nuts', 'almond', 'walnut', 'peanut'], name: 'Nuts', calories: 161, protein: 6, carbs: 6, fat: 14, fiber: 3.5, healthy: true, category: 'snack', benefits: ['Healthy fats for heart', 'Rich in vitamin E', 'Keeps you full'], suitableMeals: ['snack', 'breakfast'] },
  { keywords: ['smoothie', 'shake'], name: 'Smoothie', calories: 120, protein: 4, carbs: 24, fat: 1, fiber: 3, healthy: true, category: 'drink', benefits: ['Packed with fruits and fiber', 'Quick nutrient boost', 'Easy to digest'], suitableMeals: ['breakfast', 'snack', 'fruit'] },
  { keywords: ['soup'], name: 'Soup', calories: 80, protein: 4, carbs: 10, fat: 2, fiber: 2, healthy: true, category: 'vegetable', benefits: ['Hydrating and warming', 'Low calorie, filling', 'Easy to digest'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['curry'], name: 'Curry', calories: 200, protein: 8, carbs: 15, fat: 12, fiber: 3, healthy: false, category: 'protein', benefits: ['Anti-inflammatory spices', 'Contains turmeric'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['stir fry', 'stir-fry', 'wok'], name: 'Stir Fry', calories: 180, protein: 12, carbs: 15, fat: 8, fiber: 3, healthy: true, category: 'protein', benefits: ['Retains vegetable nutrients', 'Quick cooking preserves vitamins', 'Balanced protein and veg'], suitableMeals: ['lunch', 'dinner'] },
  { keywords: ['taco', 'burrito', 'wrap'], name: 'Wrap', calories: 220, protein: 10, carbs: 25, fat: 8, fiber: 4, healthy: false, category: 'fast', benefits: ['Portable balanced meal'], suitableMeals: ['lunch', 'snack'] },
];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 3);
}

function matchFoods(text: string): FoodEntry[] {
  const lower = text.toLowerCase();
  const tokens = tokenize(text);
  const matched: FoodEntry[] = [];
  const seen = new Set<string>();
  for (const entry of FOOD_DB) {
    let best = false;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) { best = true; break; }
    }
    if (!best && tokens.length > 0) {
      for (const kw of entry.keywords) {
        for (const tok of tokens) {
          if (tok.length < 4) continue;
          const dist = levenshtein(tok, kw);
          if (dist <= 1 || (kw.length >= 6 && dist <= 2)) { best = true; break; }
        }
        if (best) break;
      }
    }
    if (best && !seen.has(entry.name)) { matched.push(entry); seen.add(entry.name); }
  }
  return matched;
}

function buildAnalysis(matched: FoodEntry[], mealType: MealType, fallbackText: string): FoodAnalysis {
  if (matched.length === 0) {
    return {
      healthy: false, score: 0, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
      foodName: 'Unknown',
      feedback: 'Could not identify specific foods. Try mentioning ingredients like "chicken and rice" or "salad with avocado".',
      benefits: [],
      positives: [], negatives: [],
      suggestions: ['Describe the main ingredients in your meal for a better analysis.'],
    };
  }

  let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalFiber = 0;
  let healthyCount = 0;
  const positives: string[] = [];
  const negatives: string[] = [];
  const allBenefits: string[] = [];
  const foodNames: string[] = [];

  for (const m of matched) {
    totalCal += m.calories; totalProtein += m.protein; totalCarbs += m.carbs; totalFat += m.fat; totalFiber += m.fiber;
    foodNames.push(m.name);
    allBenefits.push(...m.benefits);
    if (m.healthy) { healthyCount++; positives.push(`${m.name}: good nutritious choice`); }
    else negatives.push(`${m.name} is high in calories or less nutritious`);
  }

  // Meal-type suitability checks
  const unsuitable = matched.filter((m) => !m.suitableMeals.includes(mealType));
  for (const u of unsuitable) {
    negatives.push(`${u.name} is not ideal for ${MEAL_TYPE_LABELS[mealType].label.toLowerCase()}`);
  }

  const hasVeg = matched.some((m) => m.category === 'vegetable');
  const hasFruit = matched.some((m) => m.category === 'fruit');
  const hasProtein = matched.some((m) => m.category === 'protein');
  const hasFast = matched.some((m) => m.category === 'fast');
  const hasDessert = matched.some((m) => m.category === 'dessert');
  const hasSugaryDrink = matched.some((m) => m.category === 'drink' && !m.healthy);
  const suggestions: string[] = [];

  // Meal-type-specific suggestions
  if (mealType === 'snack') {
    if (hasProtein) suggestions.push('Heavy proteins are better suited for main meals — try fruit or nuts for a snack.');
    if (totalCal > 200) suggestions.push('Snacks should be light — aim for under 200 calories.');
  }
  if (mealType === 'breakfast') {
    if (!hasProtein && !matched.some((m) => m.category === 'grain' && m.healthy)) suggestions.push('Add protein or whole grains for sustained morning energy.');
  }
  if (mealType === 'dinner') {
    if (totalCal > 600) suggestions.push('Keep dinner lighter for better sleep — aim under 600 calories.');
  }
  if (mealType === 'fruit') {
    if (matched.some((m) => m.category !== 'fruit' && m.category !== 'drink')) suggestions.push('For a fruit serving, stick to fresh fruits for maximum benefit.');
  }
  if (mealType === 'dessert') {
    if (!hasDessert && !matched.some((m) => m.category === 'fruit')) suggestions.push('A small piece of dark chocolate or fresh fruit makes a great dessert.');
  }

  if (!hasVeg && !hasFruit && (mealType === 'lunch' || mealType === 'dinner')) suggestions.push('Add a serving of vegetables for more vitamins and fiber.');
  if (hasFast) suggestions.push('Fast food is high in sodium and fat — try homemade versions instead.');
  if (hasSugaryDrink) suggestions.push('Replace sugary drinks with water or unsweetened tea.');

  const suitabilityPenalty = unsuitable.length * 10;
  const baseScore = Math.round((healthyCount / matched.length) * 100);
  const score = Math.max(0, Math.min(100, baseScore - suitabilityPenalty));
  const healthy = score >= 50 && !hasDessert && !hasFast && unsuitable.length === 0;

  let feedback = '';
  if (score >= 75) feedback = `Excellent ${MEAL_TYPE_LABELS[mealType].label.toLowerCase()}! Great balance of nutrients and healthy choices.`;
  else if (score >= 50) feedback = `Decent ${MEAL_TYPE_LABELS[mealType].label.toLowerCase()}. Some healthy items, but room for improvement.`;
  else if (score >= 25) feedback = `This ${MEAL_TYPE_LABELS[mealType].label.toLowerCase()} could be healthier. Consider the suggestions below.`;
  else feedback = `This isn't ideal for a ${MEAL_TYPE_LABELS[mealType].label.toLowerCase()}. Try adding more whole foods.`;

  return {
    healthy, score,
    calories: Math.round(totalCal), protein: Math.round(totalProtein), carbs: Math.round(totalCarbs), fat: Math.round(totalFat), fiber: Math.round(totalFiber),
    foodName: foodNames.join(' + '),
    feedback,
    benefits: allBenefits.slice(0, 4),
    positives: positives.slice(0, 4),
    negatives: negatives.slice(0, 3),
    suggestions: suggestions.slice(0, 4),
  };
}

export function analyzeFoodDescription(text: string, mealType: MealType = 'lunch'): FoodAnalysis {
  return buildAnalysis(matchFoods(text), mealType, text);
}

export function analyzeFoodPhoto(mealType: MealType = 'lunch'): FoodAnalysis {
  // Simulated photo recognition — in production this would call a vision API
  const samples = [
    'chicken rice broccoli',
    'salmon salad avocado',
    'oatmeal banana berries',
    'yogurt nuts apple',
    'egg toast avocado',
    'beef potato carrots',
    'tofu quinoa spinach',
    'shrimp noodles peppers',
    'tuna salad cucumber',
    'pancakes syrup berries',
    'burger fries soda',
    'pizza cheese tomato',
    'pasta chicken tomato',
    'lentil soup bread',
    'smoothie bowl granola',
    'steak asparagus potato',
    'sushi rice salmon',
    'wrap chicken lettuce',
    'granola milk banana',
    'salmon rice greens',
  ];
  const sample = samples[Math.floor(Math.random() * samples.length)];
  return buildAnalysis(matchFoods(sample), mealType, sample);
}

export interface SurprisePlate {
  plateName: string;
  description: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  healthy: boolean;
  feedback: string;
}

export interface RecipeStep {
  instruction: string;
  ingredient: string;
  amount: string;
  cookTimeSec: number;
  temperature?: string;
  tip?: string;
}

export interface FullRecipe {
  recipeName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalPrepTimeMin: number;
  totalCookTimeMin: number;
  servings: number;
  ingredients: { name: string; amount: string }[];
  steps: RecipeStep[];
  nutrition: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  tips: string[];
}

const RECIPE_TEMPLATES: Record<string, FullRecipe> = {
  chicken: {
    recipeName: 'Herb-Grilled Chicken Bowl',
    difficulty: 'Easy',
    totalPrepTimeMin: 10,
    totalCookTimeMin: 20,
    servings: 1,
    ingredients: [
      { name: 'Chicken breast', amount: '150g' },
      { name: 'Olive oil', amount: '1 tbsp' },
      { name: 'Salt', amount: '1/2 tsp' },
      { name: 'Black pepper', amount: '1/4 tsp' },
      { name: 'Garlic powder', amount: '1 tsp' },
      { name: 'Oregano', amount: '1 tsp' },
    ],
    steps: [
      { instruction: 'Pat chicken dry and season both sides with salt, pepper, garlic powder, and oregano', ingredient: 'Chicken breast', amount: '150g', cookTimeSec: 60, tip: 'Dry chicken sears better and gets a golden crust' },
      { instruction: 'Heat olive oil in a pan over medium-high heat until shimmering', ingredient: 'Olive oil', amount: '1 tbsp', cookTimeSec: 90, temperature: 'Medium-high' },
      { instruction: 'Place chicken in the pan and cook without moving for 5 minutes until golden', ingredient: 'Seasoned chicken', amount: '150g', cookTimeSec: 300, temperature: 'Medium-high', tip: 'Do not move the chicken — let it release naturally when ready' },
      { instruction: 'Flip and cook another 5-6 minutes until internal temperature reaches 74°C (165°F)', ingredient: 'Chicken', amount: '150g', cookTimeSec: 330, temperature: 'Medium', tip: 'Use a meat thermometer for accuracy' },
      { instruction: 'Rest the chicken for 3 minutes before slicing', ingredient: 'Cooked chicken', amount: '150g', cookTimeSec: 180, tip: 'Resting keeps the juices inside for tender meat' },
    ],
    nutrition: { calories: 280, protein: 35, carbs: 0, fat: 13, fiber: 0 },
    tips: [
      'Slice against the grain for more tender bites',
      'Pair with rice or salad for a complete meal',
      'Leftover chicken keeps 3 days refrigerated',
    ],
  },
  salmon: {
    recipeName: 'Pan-Seared Salmon',
    difficulty: 'Medium',
    totalPrepTimeMin: 8,
    totalCookTimeMin: 12,
    servings: 1,
    ingredients: [
      { name: 'Salmon fillet', amount: '180g' },
      { name: 'Olive oil', amount: '1 tbsp' },
      { name: 'Lemon', amount: '1/2' },
      { name: 'Salt', amount: '1/2 tsp' },
      { name: 'Black pepper', amount: '1/4 tsp' },
      { name: 'Fresh dill', amount: '1 tsp' },
    ],
    steps: [
      { instruction: 'Pat salmon dry with paper towels and season skin side with salt', ingredient: 'Salmon fillet', amount: '180g', cookTimeSec: 60, tip: 'Very dry skin is the secret to crispy salmon' },
      { instruction: 'Heat olive oil in a non-stick pan over medium-high heat until just smoking', ingredient: 'Olive oil', amount: '1 tbsp', cookTimeSec: 90, temperature: 'Medium-high' },
      { instruction: 'Place salmon skin-side down and press gently for 30 seconds to prevent curling', ingredient: 'Salmon', amount: '180g', cookTimeSec: 240, temperature: 'Medium-high', tip: 'Press down with a spatula for an even sear' },
      { instruction: 'Flip carefully and cook 2-3 minutes until just opaque in center', ingredient: 'Salmon', amount: '180g', cookTimeSec: 180, temperature: 'Medium' },
      { instruction: 'Squeeze lemon over the top and sprinkle with dill', ingredient: 'Lemon + dill', amount: '1/2 lemon + 1 tsp', cookTimeSec: 30, tip: 'Acid brightens the rich salmon flavor' },
    ],
    nutrition: { calories: 320, protein: 28, carbs: 2, fat: 20, fiber: 0 },
    tips: [
      'Salmon is done when it flakes easily with a fork',
      'Do not overcook — the center should still be slightly translucent',
      'Serve immediately for best texture',
    ],
  },
  egg: {
    recipeName: 'Fluffy Scrambled Eggs',
    difficulty: 'Easy',
    totalPrepTimeMin: 3,
    totalCookTimeMin: 5,
    servings: 1,
    ingredients: [
      { name: 'Eggs', amount: '2 large' },
      { name: 'Butter', amount: '1 tbsp' },
      { name: 'Salt', amount: '1 pinch' },
      { name: 'Black pepper', amount: '1 pinch' },
      { name: 'Chives', amount: '1 tsp' },
    ],
    steps: [
      { instruction: 'Crack eggs into a bowl and whisk vigorously with salt until fully blended', ingredient: 'Eggs', amount: '2 large', cookTimeSec: 60, tip: 'Whisk until no streaks of white remain' },
      { instruction: 'Melt butter in a non-stick pan over low heat until foamy', ingredient: 'Butter', amount: '1 tbsp', cookTimeSec: 60, temperature: 'Low' },
      { instruction: 'Pour in eggs and let set for 20 seconds without stirring', ingredient: 'Egg mixture', amount: '2 eggs', cookTimeSec: 20, temperature: 'Low' },
      { instruction: 'Gently push eggs from edges to center with a spatula in slow folds', ingredient: 'Eggs', amount: '2 eggs', cookTimeSec: 120, temperature: 'Low', tip: 'Slow cooking makes eggs creamy, not rubbery' },
      { instruction: 'Remove from heat while still slightly wet — they will finish cooking', ingredient: 'Scrambled eggs', amount: '2 eggs', cookTimeSec: 30, tip: 'Take them off early — residual heat finishes the job' },
      { instruction: 'Top with chives and pepper', ingredient: 'Chives + pepper', amount: '1 tsp', cookTimeSec: 15 },
    ],
    nutrition: { calories: 220, protein: 14, carbs: 1, fat: 17, fiber: 0 },
    tips: [
      'Low and slow is the secret to creamy eggs',
      'Use a non-stick pan for easy cleanup',
      'Add cheese at the end for extra richness',
    ],
  },
  oatmeal: {
    recipeName: 'Creamy Banana Oatmeal',
    difficulty: 'Easy',
    totalPrepTimeMin: 5,
    totalCookTimeMin: 8,
    servings: 1,
    ingredients: [
      { name: 'Rolled oats', amount: '1/2 cup' },
      { name: 'Milk', amount: '1 cup' },
      { name: 'Banana', amount: '1 medium' },
      { name: 'Honey', amount: '1 tsp' },
      { name: 'Cinnamon', amount: '1/2 tsp' },
      { name: 'Salt', amount: '1 pinch' },
    ],
    steps: [
      { instruction: 'Combine oats, milk, and salt in a small pot over medium heat', ingredient: 'Oats + milk + salt', amount: '1/2 cup oats + 1 cup milk', cookTimeSec: 30, temperature: 'Medium' },
      { instruction: 'Bring to a gentle simmer, stirring occasionally to prevent sticking', ingredient: 'Oat mixture', amount: '1.5 cups', cookTimeSec: 240, temperature: 'Medium-low', tip: 'Stir every minute so the bottom does not scorch' },
      { instruction: 'Mash half the banana and stir into the oats for natural sweetness', ingredient: 'Banana', amount: '1/2 banana', cookTimeSec: 30, tip: 'Mashed banana makes the oatmeal creamy and sweet' },
      { instruction: 'Remove from heat and let rest 2 minutes to thicken', ingredient: 'Oatmeal', amount: '1 serving', cookTimeSec: 120 },
      { instruction: 'Top with sliced remaining banana, honey, and cinnamon', ingredient: 'Banana + honey + cinnamon', amount: '1/2 banana + 1 tsp honey', cookTimeSec: 30 },
    ],
    nutrition: { calories: 320, protein: 10, carbs: 58, fat: 6, fiber: 6 },
    tips: [
      'Use milk instead of water for creamier oatmeal',
      'Add nuts or seeds for extra protein',
      'Adjust sweetness to taste',
    ],
  },
  salad: {
    recipeName: 'Fresh Garden Salad with Vinaigrette',
    difficulty: 'Easy',
    totalPrepTimeMin: 10,
    totalCookTimeMin: 0,
    servings: 1,
    ingredients: [
      { name: 'Mixed greens', amount: '2 cups' },
      { name: 'Cherry tomatoes', amount: '1/2 cup' },
      { name: 'Cucumber', amount: '1/2' },
      { name: 'Olive oil', amount: '1 tbsp' },
      { name: 'Lemon juice', amount: '1 tbsp' },
      { name: 'Salt and pepper', amount: 'to taste' },
    ],
    steps: [
      { instruction: 'Wash and dry the greens thoroughly — wet greens make dressing slide off', ingredient: 'Mixed greens', amount: '2 cups', cookTimeSec: 120, tip: 'A salad spinner gives the best results' },
      { instruction: 'Halve cherry tomatoes and slice cucumber thinly', ingredient: 'Tomatoes + cucumber', amount: '1/2 cup + 1/2 cucumber', cookTimeSec: 120 },
      { instruction: 'Whisk olive oil and lemon juice with salt and pepper in a small bowl', ingredient: 'Olive oil + lemon + seasoning', amount: '1 tbsp + 1 tbsp', cookTimeSec: 60, tip: 'Emulsify by whisking fast for a creamy dressing' },
      { instruction: 'Toss greens with vegetables in a large bowl', ingredient: 'Greens + veg', amount: 'All', cookTimeSec: 30 },
      { instruction: 'Drizzle dressing over the top and toss gently to coat', ingredient: 'Vinaigrette', amount: '2 tbsp', cookTimeSec: 30, tip: 'Dress just before eating to keep greens crisp' },
    ],
    nutrition: { calories: 140, protein: 3, carbs: 12, fat: 10, fiber: 4 },
    tips: [
      'Add avocado or nuts for healthy fats',
      'Dress right before serving to keep greens crunchy',
      'Try different vinegars for variety',
    ],
  },
  default: {
    recipeName: 'Simple Balanced Bowl',
    difficulty: 'Easy',
    totalPrepTimeMin: 10,
    totalCookTimeMin: 15,
    servings: 1,
    ingredients: [
      { name: 'Main ingredient', amount: '150g' },
      { name: 'Olive oil', amount: '1 tbsp' },
      { name: 'Salt', amount: '1/2 tsp' },
      { name: 'Pepper', amount: '1/4 tsp' },
      { name: 'Vegetables', amount: '1 cup' },
    ],
    steps: [
      { instruction: 'Wash and chop all ingredients into bite-sized pieces', ingredient: 'All ingredients', amount: 'As listed', cookTimeSec: 300, tip: 'Even sizes cook evenly' },
      { instruction: 'Heat oil in a pan over medium heat', ingredient: 'Olive oil', amount: '1 tbsp', cookTimeSec: 60, temperature: 'Medium' },
      { instruction: 'Cook the main ingredient 5-7 minutes, stirring occasionally', ingredient: 'Main ingredient', amount: '150g', cookTimeSec: 360, temperature: 'Medium', tip: 'Stir every 2 minutes to prevent burning' },
      { instruction: 'Add vegetables and cook 5 more minutes until tender', ingredient: 'Vegetables', amount: '1 cup', cookTimeSec: 300, temperature: 'Medium' },
      { instruction: 'Season with salt and pepper, toss to combine', ingredient: 'Seasoning', amount: '1/2 tsp + 1/4 tsp', cookTimeSec: 30 },
    ],
    nutrition: { calories: 250, protein: 20, carbs: 15, fat: 10, fiber: 4 },
    tips: [
      'Taste and adjust seasoning before serving',
      'Add herbs or spices for extra flavor',
      'Serve hot for best results',
    ],
  },
};

export function generateFullRecipe(ingredientText: string, mealType: MealType): FullRecipe {
  const matched = matchFoods(ingredientText);
  const lower = ingredientText.toLowerCase();

  // Pick the best matching recipe template
  let template = RECIPE_TEMPLATES.default;
  for (const m of matched) {
    if (m.keywords.some((kw) => lower.includes(kw))) {
      if (m.category === 'protein') {
        if (m.name === 'Chicken') template = RECIPE_TEMPLATES.chicken;
        else if (m.name === 'Salmon') template = RECIPE_TEMPLATES.salmon;
        else if (m.name === 'Eggs') template = RECIPE_TEMPLATES.egg;
        break;
      }
      if (m.category === 'grain' && m.name === 'Oatmeal') { template = RECIPE_TEMPLATES.oatmeal; break; }
      if (m.category === 'vegetable' || m.category === 'fruit') { template = RECIPE_TEMPLATES.salad; break; }
    }
  }
  if (lower.includes('salad') || lower.includes('vegetable')) template = RECIPE_TEMPLATES.salad;
  if (lower.includes('oat') || lower.includes('porridge')) template = RECIPE_TEMPLATES.oatmeal;
  if (lower.includes('egg')) template = RECIPE_TEMPLATES.egg;
  if (lower.includes('salmon') || lower.includes('fish')) template = RECIPE_TEMPLATES.salmon;
  if (lower.includes('chicken')) template = RECIPE_TEMPLATES.chicken;

  // Adjust difficulty based on meal type
  let difficulty: FullRecipe['difficulty'] = template.difficulty;
  if (mealType === 'snack' || mealType === 'fruit') difficulty = 'Easy';

  return { ...template, difficulty };
}

export function generateSurprisePlate(ingredientText: string, mealType: MealType, variant = 0): SurprisePlate {
  const matched = matchFoods(ingredientText);
  if (matched.length === 0) {
    return {
      plateName: 'No ingredients found',
      description: 'Could not identify ingredients. Try describing what you have, like "rice, chicken, broccoli".',
      ingredients: [], calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, healthy: false,
      feedback: 'Add more ingredient details for a custom plate.',
    };
  }

  // Filter to suitable foods for this meal type, but keep all if too few match
  const suitable = matched.filter((m) => m.suitableMeals.includes(mealType));
  const chosen = suitable.length >= 2 ? suitable : matched;

  // Categorize available ingredients
  const byCat = (cat: FoodEntry['category']) => chosen.filter((m) => m.category === cat);
  const proteins = byCat('protein');
  const vegs = byCat('vegetable');
  const grains = byCat('grain').filter((m) => m.healthy);
  const fruits = byCat('fruit');
  const dairies = byCat('dairy').filter((m) => m.healthy);
  const snacks = byCat('snack');

  // Pick with rotation so each variant differs
  const pick = <T,>(arr: T[], idx: number): T | undefined =>
    arr.length === 0 ? undefined : arr[((idx % arr.length) + arr.length) % arr.length];

  const protein = pick(proteins, variant);
  const veg = pick(vegs, variant + (variant % 2 === 0 ? 0 : 1));
  const grain = pick(grains, variant);
  const fruit = pick(fruits, variant);
  const dairy = pick(dairies, variant);
  const snack = pick(snacks, variant);

  const plate: FoodEntry[] = [];
  // Variant 0: protein-forward; Variant 1: plant-forward; Variant 2: grain bowl; etc.
  if (variant % 3 === 0) {
    if (protein) plate.push(protein);
    if (veg) plate.push(veg);
    else if (grain) plate.push(grain);
  } else if (variant % 3 === 1) {
    if (grain) plate.push(grain);
    if (veg) plate.push(veg);
    if (protein && !plate.includes(protein)) plate.push(protein);
  } else {
    if (veg) plate.push(veg);
    if (protein) plate.push(protein);
    else if (grain) plate.push(grain);
  }
  if (fruit && mealType !== 'dinner' && !plate.includes(fruit)) plate.push(fruit);
  else if (dairy && (mealType === 'breakfast' || mealType === 'snack') && !plate.includes(dairy)) plate.push(dairy);
  else if (snack && mealType === 'snack' && !plate.includes(snack)) plate.push(snack);

  const finalPlate = plate.length > 0 ? plate : chosen.slice(0, 3);

  let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalFiber = 0;
  for (const f of finalPlate) {
    totalCal += f.calories; totalProtein += f.protein; totalCarbs += f.carbs; totalFat += f.fat; totalFiber += f.fiber;
  }

  const healthyCount = finalPlate.filter((f) => f.healthy).length;
  const healthy = healthyCount >= Math.ceil(finalPlate.length / 2);
  const plateNames = [
    `${MEAL_TYPE_LABELS[mealType].label} Power Bowl`,
    `${MEAL_TYPE_LABELS[mealType].label} Garden Plate`,
    `${MEAL_TYPE_LABELS[mealType].label} Harvest Bowl`,
    `${MEAL_TYPE_LABELS[mealType].label} Fresh Mix`,
    `${MEAL_TYPE_LABELS[mealType].label} Balance Bowl`,
  ];
  const plateName = plateNames[variant % plateNames.length];

  const components: string[] = [];
  if (protein) components.push('protein');
  if (veg) components.push('vegetables');
  if (grain) components.push('whole grains');
  if (fruit) components.push('fruit');
  if (dairy) components.push('dairy');

  const description = `A balanced ${MEAL_TYPE_LABELS[mealType].label.toLowerCase()} plate with ${components.join(', ') || 'mixed ingredients'}. Built from what you have available.`;

  let feedback = '';
  if (healthy && finalPlate.length >= 3) {
    feedback = `Great balanced plate! Good mix of ${components.join(', ')} for your ${MEAL_TYPE_LABELS[mealType].label.toLowerCase()}.`;
  } else if (healthy) {
    feedback = `A healthy ${MEAL_TYPE_LABELS[mealType].label.toLowerCase()} option with the ingredients available.`;
  } else {
    feedback = `This plate works with what you have, but could be improved with more vegetables or whole foods.`;
  }

  // Add a rotation hint after the first variant
  if (variant > 0) {
    feedback += ` This is an alternate arrangement of your ingredients.`;
  }

  return {
    plateName,
    description,
    ingredients: finalPlate.map((f) => f.name),
    calories: Math.round(totalCal),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
    fiber: Math.round(totalFiber),
    healthy,
    feedback,
  };
}
