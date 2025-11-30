/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins-Regular"],
        "poppins-bold": ["Poppins-Bold"],
      },
      colors: {
        main: "#0A5BAA",
        secondary: "#0E7BD5",
        "light-green": "#15B368",
        "dark-green": "#0D7F3E",
      },
    },
  },
  plugins: [],
};
