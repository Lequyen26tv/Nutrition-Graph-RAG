/** @type {import('tailwindcss').Config} */
export default {

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#059669",       // emerald-600
        primarySoft: "#D1FAE5",   // emerald-100
        secondary: "#0D9488",     // teal-600
        accent: "#F59E0B",        // amber-500
        danger: "#E11D48",        // rose-600
        bg: "#F8FAFC",            // slate-50
      },
    },

    plugins: [],
  }
}
