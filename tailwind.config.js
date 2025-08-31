/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', 
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'app': {
          'bg-primary': '#000000',
          'bg-secondary': '#1f2937',
          'bg-tertiary': '#374151',
          'surface-primary': '#374151',
          'surface-secondary': '#27272a',
          'surface-tertiary': '#18181B',
          'text-primary': '#ffffff',
          'text-secondary': '#d1d5db',
          'text-tertiary': '#9ca3af',
          'text-muted': '#6b7280',
          'accent-primary': '#A3FF57',
          'accent-success': '#22c55e',
          'accent-error': '#ef4444',
          'accent-warning': '#f59e0b',
          'macro-carbs': '#0EA5E9',
          'macro-protein': '#10B981',
          'macro-fat': '#F97316',
          'macro-calories': '#E11D48',
          'accent-danger': '#ef4444',
        },
      },
    },
  },
  plugins: [],
};

