import { create } from "zustand";
import { Day, MealType, MEAL_ORDER } from "../(types)/domain";
import {
  getDayData,
  addDishToMeal as addDishToMealAPI,
  removeDishFromMeal as removeDishFromMealAPI,
  updateIngredientGrams,
  convertDayDtoToDay,
} from "../services/dishService";

interface DayStore {
  day: Day;
  loading: boolean;
  error: string | null;
  addDishToMeal: (mealType: MealType, dishId: string) => Promise<void>;
  removeDishFromMeal: (mealType: MealType, mealDishId: number) => Promise<void>;
  setIngredientOverride: (
    mealType: MealType,
    mealDishId: number,
    ingredientId: string,
    grams: number
  ) => Promise<void>;
  loadDayData: (date: string) => Promise<void>;
  clearError: () => void;
}

// Función para crear un día inicial vacío
function createEmptyDay(date: string): Day {
  return {
    id: 0,
    date,
    meals: MEAL_ORDER.map((mealType) => ({
      type: mealType as MealType,
      items: [],
    })),
  };
}

export const useDayStore = create<DayStore>((set, get) => ({
  day: createEmptyDay(new Date().toISOString().split("T")[0]),
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  loadDayData: async (date: string) => {
    set({ loading: true, error: null });
    try {
      const dayDto = await getDayData(date);
      if (dayDto) {
        const day = convertDayDtoToDay(dayDto);
        set({ day, loading: false });
      } else {
        // If is empty, create day with empty meals
        const emptyDay = createEmptyDay(date);
        set({ day: emptyDay, loading: false });
      }
    } catch (error) {
      console.error("Error loading day data:", error);
      set({ error: "Error cargando datos del día", loading: false });
    }
  },

  addDishToMeal: async (mealType: MealType, dishId: string) => {
    const currentDay = get().day;
    const dishIdNumber = parseInt(dishId);

    // Optimistic UI update
    const optimisticMealDish = {
      mealDishId: -1,
      dishId,
      overrides: [],
    };

    set((state) => {
      const newDay = { ...state.day };
      const meal = newDay.meals.find((m) => m.type === mealType);
      if (meal) {
        meal.items = [...meal.items, optimisticMealDish];
      }
      return { day: newDay, error: null };
    });

    try {
      const result = await addDishToMealAPI(
        currentDay.date,
        mealType,
        dishIdNumber
      );

      if (!result) {
        set({
          day: currentDay,
          error: "Error añadiendo plato a la comida",
        });
      } else {
        set((state) => {
          const newDay = { ...state.day };
          const meal = newDay.meals.find((m) => m.type === mealType);
          if (meal) {
            const tempIndex = meal.items.findIndex(
              (item) => item.mealDishId === -1
            );
            if (tempIndex !== -1) {
              meal.items[tempIndex] = {
                mealDishId: result.mealDishId,
                dishId: result.dishId.toString(),
                overrides: result.overrides.map((override) => ({
                  ingredientId: override.ingredientId.toString(),
                  grams: override.grams,
                })),
              };
            }
          }
          return { day: newDay, error: null };
        });
      }
    } catch (error) {
      console.error("Error adding dish to meal:", error);
      // Rollback on failure
      set({
        day: currentDay,
        error: "Error añadiendo plato a la comida",
      });
    }
  },

  removeDishFromMeal: async (mealType: MealType, mealDishId: number) => {
    const currentDay = get().day;

    // Optimistic UI update
    set((state) => {
      const newDay = { ...state.day };
      const meal = newDay.meals.find((m) => m.type === mealType);

      if (meal) {
        const itemIndex = meal.items.findIndex(
          (item) => item.mealDishId === mealDishId
        );
        if (itemIndex !== -1) {
          meal.items.splice(itemIndex, 1);
        }
      }

      return { day: newDay, error: null };
    });

    // API call
    try {
      const result = await removeDishFromMealAPI(
        currentDay.date,
        mealType,
        mealDishId
      );

      if (!result) {
        // Rollback on failure
        set({
          day: currentDay,
          error: "Error eliminando plato de la comida",
        });
      }
    } catch (error) {
      console.error("Error removing dish from meal:", error);
      // Rollback on failure
      set({
        day: currentDay,
        error: "Error eliminando plato de la comida",
      });
    }
  },

  setIngredientOverride: async (
    mealType: MealType,
    mealDishId: number,
    ingredientId: string,
    grams: number
  ) => {
    const currentDay = get().day;
    const ingredientIdNumber = parseInt(ingredientId);

    // Validate mealDishId not undefined
    if (mealDishId === undefined || mealDishId === null) {
      console.error("mealDishId is undefined or null");
      const error = "Error: ID de plato no válido";
      set({ error });
      throw new Error(error);
    }

    // Optimistic UI update
    set((state) => {
      const newDay = { ...state.day };
      const meal = newDay.meals.find((m) => m.type === mealType);

      if (meal) {
        const mealDish = meal.items.find(
          (item) => item.mealDishId === mealDishId
        );

        if (mealDish) {
          const existingOverride = mealDish.overrides.find(
            (o) => o.ingredientId === ingredientId
          );

          if (existingOverride) {
            existingOverride.grams = grams;
          } else {
            mealDish.overrides.push({ ingredientId, grams });
          }
        } else {
          console.error("MealDish not found with mealDishId:", mealDishId);
          const error = "Plato no encontrado";
          set({ error });
          throw new Error(error);
        }
      }

      return { day: newDay, error: null };
    });

    // API call
    try {
      const success = await updateIngredientGrams(
        currentDay.date,
        mealType,
        mealDishId,
        ingredientIdNumber,
        grams
      );

      if (!success) {
        // Rollback on failure
        const error = "Error actualizando cantidad de ingrediente";
        set({
          day: currentDay,
          error,
        });
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error updating ingredient override:", error);
      // Rollback on failure
      const errorMessage = "Error actualizando cantidad de ingrediente";
      set({
        day: currentDay,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },
}));
