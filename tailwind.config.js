/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        sand: '#f2ede4',
        olive: '#7a8b71',
        teal: '#1f3d3a',
        dusk: '#1b1f24'
      },
      fontFamily: {
        display: ['System'],
        body: ['System']
      }
    }
  },
  plugins: []
};
