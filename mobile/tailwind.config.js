/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./components/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter-Regular'],
        'inter-light': ['Inter-Light'],
        'inter-medium': ['Inter-Medium'],
        'inter-semibold': ['Inter-SemiBold'],
        'inter-bold': ['Inter-Bold'],
        'inter-extrabold': ['Inter-ExtraBold'],

        raleway: ['Raleway-Regular'],
        'raleway-light': ['Raleway-Light'],
        'raleway-medium': ['Raleway-Medium'],
        'raleway-semibold': ['Raleway-SemiBold'],
        'raleway-bold': ['Raleway-Bold'],
        'raleway-extrabold': ['Raleway-ExtraBold'],
      },
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // Синий
          light: '#93C5FD', // Светло-синий
          dark: '#1D4ED8', // Тёмно-синий
        },
        background: {
          DEFAULT: '#FFFFFF', // Белый
          subtle: '#F9FAFB', // Светло-серый
        },
        surface: {
          DEFAULT: '#FFFFFF', // Белый
          gray: '#F3F4F6', // Светло-серый
        },
        text: {
          DEFAULT: '#111827', // Черный
          secondary: '#6B7280', // Серый
          inverse: '#FFFFFF', // Белый
        },
        status: {
          error: '#EF4444', // Красный
          success: '#87e4ab', // Зеленый
        },
      },
    },
  },
  plugins: [],
};
