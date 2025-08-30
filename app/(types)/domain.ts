export type Nutrients = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  satFat?: number;
};

export type Ingredient = {
  id: string;
  name: string;
  baseQuantity: number; // grams
  nutrientsPer100g: Nutrients;
};

export type Dish = {
  id: string;
  name: string;
  ingredients: Ingredient[];
  imageUrl?: string;
};

export type MealType = "breakfast" | "lunch" | "snack" | "dinner" | "extras";

export type MealDishIngredientOverrideDto = {
  ingredientId: string;
  grams: number;
};

export type MealDish = {
  mealDishId: number;
  dishId: string;
  overrides: MealDishIngredientOverrideDto[];
};

export type Meal = {
  type: MealType;
  items: MealDish[];
};

export type Day = {
  id: number;
  date: string; // YYYY-MM-DD string
  meals: Meal[];
};

export type MealDishIngredientOverrideDtoDto = {
  ingredientId: number;
  grams: number;
};

export type MealItemDto = {
  mealDishId: number;
  dishId: number;
  overrides: MealDishIngredientOverrideDtoDto[];
};

export type MealDto = {
  type: MealType;
  items: MealItemDto[];
};

export type DayDto = {
  id: number;
  date: string;
  meals: MealDto[];
};

export type MealDisplayNames = {
  [K in MealType]: string;
};

export const MEAL_DISPLAY_NAMES: MealDisplayNames = {
  breakfast: "Desayuno",
  lunch: "Comida",
  snack: "Merienda",
  dinner: "Cena",
  extras: "Aperitivos",
};

export const MEAL_ORDER: MealType[] = [
  "breakfast",
  "lunch",
  "snack",
  "dinner",
  "extras",
];
