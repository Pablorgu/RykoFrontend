export const THEME_COLORS = {
  // Fondos principales
  background: {
    primary: "#000000", // Negro principal
    secondary: "#1f2937", // Gris oscuro para contenedores
    tertiary: "#374151", // Gris medio para elementos secundarios
    modal: "#1f2937",
  },

  // Colores de superficie
  surface: {
    primary: "#374151", // bg-gray-700
    secondary: "#27272a", // bg-gray-600
    tertiary: "#18181B", // bg-gray-500
  },

  // Colores de texto
  text: {
    primary: "#ffffff",
    secondary: "#d1d5db", // text-gray-300
    tertiary: "#9ca3af", // text-gray-400
    muted: "#6b7280", // text-gray-500
  },

  // Colores de acento
  accent: {
    primary: "#A3FF57", // Verde principal
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
  },

  // Colores de macronutrientes
  macros: {
    carbs: "#0EA5E9",
    protein: "#10B981",
    fat: "#F97316",
    calories: "#E11D48",
  },
  danger: {
    primary: "#FF6B6B",
  },
};

// Exportar colores individuales para fácil acceso
export const { background, surface, text, accent, macros } = THEME_COLORS;
