import { useState, useCallback } from "react";
import { Alert } from "react-native";
import {
  RecommendationDto,
  RecommendationResp,
  MacroVector,
} from "../(types)/nutrition";
import { nutrientsForDayAsync } from "../(types)/nutrition";
import client from "../api/client";
import { useDayStore } from "../(store)/dayStore";
import { useAuthStore } from "../(store)/authStore";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface UseRecommendationReturn {
  current: RecommendationDto | null;
  exclude: number[];
  loading: boolean;
  reason?: string;
  load: () => Promise<void>;
  accept: () => Promise<void>;
  another: () => Promise<void>;
  reject: () => void;
  reset: () => void;
}

// Helper function to calculate remaining macros
const calculateRemainingMacros = async (): Promise<MacroVector> => {
  const { day } = useDayStore.getState();
  const { user } = useAuthStore.getState();

  let remainingMacros: MacroVector = {
    kcal: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
  };

  if (user && user.calorieGoal) {
    const calories = user.calorieGoal;
    const proteinPct = user.proteinPct || 30;
    const carbsPct = user.carbsPct || 40;
    const fatPct = user.fatPct || 30;

    const dailyGoals = {
      kcal: calories,
      protein: Math.round((calories * proteinPct) / 100 / 4),
      carbs: Math.round((calories * carbsPct) / 100 / 4),
      fat: Math.round((calories * fatPct) / 100 / 9),
    };

    if (day) {
      const currentNutrients = await nutrientsForDayAsync(day);
      remainingMacros = {
        kcal: Math.max(0, dailyGoals.kcal - currentNutrients.kcal),
        protein: Math.max(0, dailyGoals.protein - currentNutrients.protein),
        carbs: Math.max(0, dailyGoals.carbs - currentNutrients.carbs),
        fat: Math.max(0, dailyGoals.fat - currentNutrients.fat),
      };
    } else {
      remainingMacros = dailyGoals;
    }
  }

  return remainingMacros;
};

export function useRecommendation(
  date: string,
  mealType: MealType
): UseRecommendationReturn {
  const [current, setCurrent] = useState<RecommendationDto | null>(null);
  const [exclude, setExclude] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState<string | undefined>();
  const { addDishToMeal } = useDayStore();

  const reset = useCallback(() => {
    setCurrent(null);
    setExclude([]);
    setReason(undefined);
  }, []);

  const loadRecommendation = useCallback(async () => {
    if (!date || !mealType) return;

    setLoading(true);

    try {
      // Calcular macros restantes del día
      const remainingMacros = await calculateRemainingMacros();

      let url = `/recommendation/${date}`;
      const params = new URLSearchParams();

      if (exclude.length > 0) {
        params.append("exclude", exclude.join(","));
      }

      // Enviar macros restantes como query parameters
      params.append("remainingKcal", remainingMacros.kcal.toString());
      params.append("remainingProtein", remainingMacros.protein.toString());
      params.append("remainingCarbs", remainingMacros.carbs.toString());
      params.append("remainingFat", remainingMacros.fat.toString());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await client.get<RecommendationResp>(url);
      if (response.data) {
        // Always capture the reason from diagnostics
        const reasonValue = response.data.diagnostics?.reason || undefined;
        setReason(reasonValue);

        if (response.data.recommendation) {
          setCurrent(response.data.recommendation);
        } else {
          console.error("No se pudo obtener una recomendación");
          setCurrent(null);
        }
      } else {
        console.error("No se pudo obtener una recomendación");
      }
    } catch (err: any) {
      console.error(
        "Error al cargar recomendación:",
        err.response?.data?.message || err.message
      );
    } finally {
      setLoading(false);
    }
  }, [date, mealType]);

  const accept = useCallback(async () => {
    if (!current || !date || !mealType) return;

    try {
      const response = await client.post(
        `/day/${date}/meals/${mealType}/dishes/with-scale`,
        {
          dishId: current.dishId,
          scaleFactor: current.scale,
        }
      );

      // Update only the specific meal optimistically
      if (response.data) {
        const mealData = response.data;
        const { day } = useDayStore.getState();

        // Update only the specific meal without affecting carousel position
        const updatedDay = {
          ...day,
          meals: day.meals.map((meal) =>
            meal.type === mealType
              ? {
                  ...meal,
                  items: [
                    ...meal.items,
                    {
                      mealDishId: mealData.mealDishId,
                      dishId: mealData.dishId.toString(),
                      overrides: mealData.overrides.map((override: any) => ({
                        ingredientId: override.ingredientId.toString(),
                        grams: override.grams,
                      })),
                    },
                  ],
                }
              : meal
          ),
        };

        // Update the store with the new day
        useDayStore.setState({ day: updatedDay });
      }
      reset();
    } catch (error) {
      console.error("Error accepting recommendation:", error);
      Alert.alert("Error", "No se pudo añadir el plato");
    }
  }, [current, date, mealType, reset, addDishToMeal]);

  const another = useCallback(async () => {
    if (!current) {
      return;
    }

    // Add current dish to exclude list
    const newExclude = [...exclude, current.dishId];
    setExclude(newExclude);

    // Load new recommendation with updated exclude list
    setLoading(true);
    try {
      //Calculate remaining macros
      const remainingMacros = await calculateRemainingMacros();

      let url = `/recommendation/${date}`;
      const params = new URLSearchParams();

      if (newExclude.length > 0) {
        params.append("exclude", newExclude.join(","));
      }

      params.append("remainingKcal", remainingMacros.kcal.toString());
      params.append("remainingProtein", remainingMacros.protein.toString());
      params.append("remainingCarbs", remainingMacros.carbs.toString());
      params.append("remainingFat", remainingMacros.fat.toString());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await client.get<RecommendationResp>(url);
      if (response.data) {
        // Always capture the reason from diagnostics
        const reasonValue = response.data.diagnostics?.reason || undefined;
        setReason(reasonValue);

        if (response.data.recommendation) {
          setCurrent(response.data.recommendation);
        } else {
          setCurrent(null);
        }
      } else {
      }
    } catch (err: any) {
      console.error(
        "Error al cargar recomendación:",
        err.response?.data?.message || err.message
      );
    } finally {
      setLoading(false);
    }
  }, [current, exclude, date]);

  const reject = useCallback(() => {
    reset();
  }, [reset]);

  return {
    current,
    exclude,
    loading,
    reason,
    load: loadRecommendation,
    accept,
    another,
    reject,
    reset,
  };
}
function loadDayData(date: string) {
  throw new Error("Function not implemented.");
}
