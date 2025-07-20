/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'nunito': ['Nunito', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1E90FF', // Bleu Confiance
          dark: '#0066CC', // Hover foncé
          light: '#4DA6FF',
        },
        background: {
          light: '#F5F5F5', // Gris clair
          dark: '#181818', // Mode sombre
        },
        text: {
          primary: '#2B2B2B', // Noir doux
          light: '#ECECEC', // Texte clair pour dark mode
        },
        success: '#2ECC71', // Vert succès
        danger: '#E74C3C', // Rouge alerte
        warning: '#FFB400', // Jaune accessibilité
        accent: '#8E44AD', // Violet innovation
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode via class
}
