import api from "../api/client";
import { Dish, Day, DayDto, MealItemDto, MealType } from "../(types)/domain";

// Get a dish by ID
export const getDishById = async (id: string): Promise<Dish | null> => {
  try {
    const response = await api.get(`/dishes/${id}/detailed`);
    return response.data;
  } catch (error) {
    console.error("Error fetching dish:", error);
    return null;
  }
};

// Search dishes by name and user
export const searchDishes = async (
  name: string,
  userId: number
): Promise<Dish[]> => {
  try {
    const response = await api.get("/dishes/filter", {
      params: {
        name: name,
        userId: userId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching dishes:", error);
    return [];
  }
};

// Get all dishes for a specific user
export const getAllDishes = async (userId: number): Promise<Dish[]> => {
  try {
    const response = await api.get(`/dishes/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all dishes for user:", error);
    return [];
  }
};

// Get day data
export const getDayData = async (date: string): Promise<DayDto | null> => {
  try {
    const response = await api.get(`/day/${date}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching day data:", error);
    return null;
  }
};

// Add dish to meal
export const addDishToMeal = async (
  date: string,
  mealType: MealType,
  dishId: number
): Promise<MealItemDto | null> => {
  try {
    const addDishToMealDto = {
      dishId,
    };
    const response = await api.post(
      `/day/${date}/meals/${mealType}/dishes`,
      addDishToMealDto
    );
    return response.data;
  } catch (error) {
    console.error("Error adding dish to meal:", error);
    return null;
  }
};

// Update ingredient grams
export const updateIngredientGrams = async (
  date: string,
  mealType: MealType,
  mealDishId: number,
  ingredientId: number,
  grams: number
): Promise<boolean> => {
  try {
    await api.patch(
      `/day/${date}/meals/${mealType}/dishes/${mealDishId}/ingredients/${ingredientId}`,
      { grams }
    );
    return true;
  } catch (error) {
    console.error("Error updating ingredient grams:", error);
    return false;
  }
};

// Remove dish from meal
export const removeDishFromMeal = async (
  date: string,
  mealType: MealType,
  mealDishId: number
): Promise<DayDto | boolean> => {
  try {
    const response = await api.delete(
      `/day/${date}/meals/${mealType}/dishes/${mealDishId}`
    );
    return response.status === 204 ? true : response.data;
  } catch (error) {
    console.error("Error removing dish from meal:", error);
    return false;
  }
};

// Helper function to convert DayDto to Day
export const convertDayDtoToDay = (dayDto: DayDto): Day => {
  return {
    id: dayDto.id,
    date: dayDto.date,
    meals: dayDto.meals.map((meal) => ({
      type: meal.type,
      items: meal.items.map((item) => ({
        dishId: item.dishId.toString(),
        mealDishId: item.mealDishId,
        overrides: item.overrides.map((override) => ({
          ingredientId: override.ingredientId.toString(),
          grams: override.grams,
        })),
      })),
    })),
  };
};

// Helper function to convert Day to DayDto
export const convertDayToDayDto = (day: Day): DayDto => {
  return {
    id: day.id,
    date: day.date,
    meals: day.meals.map((meal) => ({
      type: meal.type,
      items: meal.items.map((item) => ({
        mealDishId: 0, // Will be assigned in the backend
        dishId: parseInt(item.dishId),
        overrides: item.overrides.map((override) => ({
          ingredientId: parseInt(override.ingredientId),
          grams: override.grams,
        })),
      })),
    })),
  };
};

// Delete a dish by ID
export const deleteDish = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/dishes/${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting dish:", error);
    return false;
  }
};
