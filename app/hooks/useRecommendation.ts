import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { RecommendationDto, RecommendationResp } from "../(types)/nutrition";
import client from "../api/client";
import { useDayStore } from "../(store)/dayStore";

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
      const response = await client.get<RecommendationResp>(
        `/recommendation/${date}`
      );

      if (response.data && response.data.recommendation) {
        setCurrent(response.data.recommendation);
        setReason(response.data.diagnostics?.reason || undefined);
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
      // Nota: Esta URL puede necesitar ajuste según la implementación real del backend
      await client.post(`/day/${date}/meals/${mealType}/dishes`, {
        dishId: current.dishId,
        scale: current.scale,
        overrides: current.overrides,
      });

      // Update local state
      await addDishToMeal(mealType, current.dishId.toString());

      reset();
      Alert.alert("Éxito", "Plato añadido correctamente");
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
    setExclude((prev) => {
      const newExclude = [...prev, current.dishId];
      return newExclude;
    });

    // Load new recommendation
    await loadRecommendation();
  }, [current, loadRecommendation]);

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
