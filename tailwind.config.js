/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Taken from the myCareNotes logo blue (#3D72F5)
        brand: {
          50: '#EEF3FF',
          100: '#DCE6FE',
          200: '#BFD1FD',
          300: '#94B3FB',
          400: '#658DF8',
          500: '#3D72F5',
          600: '#2A5BE0',
          700: '#2248B8',
          800: '#213E91',
          900: '#1F3773',
          950: '#16224A',
        },
        canvas: '#F6F7FB',
      },
    },
  },
  plugins: [],
};
