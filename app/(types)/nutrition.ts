import {
  Nutrients,
  Ingredient,
  Dish,
  MealDishIngredientOverrideDto,
  Meal,
  Day,
} from "./domain";

import { getDishById } from "../services/dishService";

/**
 * Calculates nutrients for a specific amount of an ingredient
 */
export function nutrientsForIngredient(
  ingredient: Ingredient,
  grams: number
): Nutrients {
  const factor = grams / 100;
  const base = ingredient.nutrientsPer100g;

  return {
    kcal: Math.round(base.kcal * factor * 100) / 100,
    protein: Math.round(base.protein * factor * 100) / 100,
    carbs: Math.round(base.carbs * factor * 100) / 100,
    fat: Math.round(base.fat * factor * 100) / 100,
    fiber: base.fiber ? Math.round(base.fiber * factor * 100) / 100 : undefined,
    satFat: base.satFat
      ? Math.round(base.satFat * factor * 100) / 100
      : undefined,
  };
}

/**
 * Calculates total nutrients for a dish applying overrides
 */
export function nutrientsForDish(
  dish: Dish,
  overrides: MealDishIngredientOverrideDto[] = []
): Nutrients {
  // Validate that the dish and its ingredients exist
  if (!dish || !dish.ingredients || !Array.isArray(dish.ingredients)) {
    return {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      satFat: 0,
    };
  }

  const overrideMap = new Map(overrides.map((o) => [o.ingredientId, o.grams]));

  const totals: Nutrients = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    satFat: 0,
  };

  dish.ingredients.forEach((ingredient) => {
    const grams = overrideMap.get(ingredient.id) ?? ingredient.baseQuantity;
    const nutrients = nutrientsForIngredient(ingredient, grams);

    totals.kcal += nutrients.kcal;
    totals.protein += nutrients.protein;
    totals.carbs += nutrients.carbs;
    totals.fat += nutrients.fat;
    if (nutrients.fiber) totals.fiber! += nutrients.fiber;
    if (nutrients.satFat) totals.satFat! += nutrients.satFat;
  });

  return {
    kcal: Math.round(totals.kcal * 100) / 100,
    protein: Math.round(totals.protein * 100) / 100,
    carbs: Math.round(totals.carbs * 100) / 100,
    fat: Math.round(totals.fat * 100) / 100,
    fiber: totals.fiber ? Math.round(totals.fiber * 100) / 100 : undefined,
    satFat: totals.satFat ? Math.round(totals.satFat * 100) / 100 : undefined,
  };
}

/**
 * Calculates total nutrients for a meal
 */
export function nutrientsForMeal(
  meal: Meal,
  dishLookup: (id: string) => Dish | undefined
): Nutrients {
  const totals: Nutrients = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    satFat: 0,
  };

  meal.items.forEach((mealDish) => {
    const dish = dishLookup(mealDish.dishId);
    if (!dish) return;

    const nutrients = nutrientsForDish(dish, mealDish.overrides);

    totals.kcal += nutrients.kcal;
    totals.protein += nutrients.protein;
    totals.carbs += nutrients.carbs;
    totals.fat += nutrients.fat;
    if (nutrients.fiber) totals.fiber! += nutrients.fiber;
    if (nutrients.satFat) totals.satFat! += nutrients.satFat;
  });

  return {
    kcal: Math.round(totals.kcal * 100) / 100,
    protein: Math.round(totals.protein * 100) / 100,
    carbs: Math.round(totals.carbs * 100) / 100,
    fat: Math.round(totals.fat * 100) / 100,
    fiber: totals.fiber ? Math.round(totals.fiber * 100) / 100 : undefined,
    satFat: totals.satFat ? Math.round(totals.satFat * 100) / 100 : undefined,
  };
}

/**
 * Calculates total nutrients for the day
 */
export function nutrientsForDay(
  day: Day,
  dishLookup: (id: string) => Dish | undefined
): Nutrients {
  const totals: Nutrients = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    satFat: 0,
  };

  day.meals.forEach((meal) => {
    const nutrients = nutrientsForMeal(meal, dishLookup);

    totals.kcal += nutrients.kcal;
    totals.protein += nutrients.protein;
    totals.carbs += nutrients.carbs;
    totals.fat += nutrients.fat;
    if (nutrients.fiber) totals.fiber! += nutrients.fiber;
    if (nutrients.satFat) totals.satFat! += nutrients.satFat;
  });

  return {
    kcal: Math.round(totals.kcal * 100) / 100,
    protein: Math.round(totals.protein * 100) / 100,
    carbs: Math.round(totals.carbs * 100) / 100,
    fat: Math.round(totals.fat * 100) / 100,
    fiber: totals.fiber ? Math.round(totals.fiber * 100) / 100 : undefined,
    satFat: totals.satFat ? Math.round(totals.satFat * 100) / 100 : undefined,
  };
}

/**
 * Adds two nutrient objects
 */
export function addNutrients(a: Nutrients, b: Nutrients): Nutrients {
  return {
    kcal: Math.round((a.kcal + b.kcal) * 100) / 100,
    protein: Math.round((a.protein + b.protein) * 100) / 100,
    carbs: Math.round((a.carbs + b.carbs) * 100) / 100,
    fat: Math.round((a.fat + b.fat) * 100) / 100,
    fiber: (a.fiber || 0) + (b.fiber || 0) || undefined,
    satFat: (a.satFat || 0) + (b.satFat || 0) || undefined,
  };
}

export async function nutrientsForMealAsync(meal: Meal): Promise<Nutrients> {
  let totalNutrients: Nutrients = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  for (const mealDish of meal.items) {
    const dish = await getDishById(mealDish.dishId);
    if (dish) {
      const dishNutrients = nutrientsForDish(dish, mealDish.overrides);
      totalNutrients.kcal += dishNutrients.kcal;
      totalNutrients.protein += dishNutrients.protein;
      totalNutrients.carbs += dishNutrients.carbs;
      totalNutrients.fat += dishNutrients.fat;
    }
  }

  return totalNutrients;
}

export async function nutrientsForDayAsync(day: Day): Promise<Nutrients> {
  let totalNutrients: Nutrients = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  for (const meal of day.meals) {
    const mealNutrients = await nutrientsForMealAsync(meal);
    totalNutrients.kcal += mealNutrients.kcal;
    totalNutrients.protein += mealNutrients.protein;
    totalNutrients.carbs += mealNutrients.carbs;
    totalNutrients.fat += mealNutrients.fat;
  }

  return totalNutrients;
}
