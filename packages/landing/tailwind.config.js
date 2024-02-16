const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./**/*.{html,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Noto Sans"',
          ...defaultTheme.fontFamily.sans.filter(
            (family) => family !== '"Noto Sans"'
          ),
        ],
      },
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.stone,
      red: colors.red,
      green: {
        50: '#F3FAF8',
        100: '#D8EFEB',
        200: '#B2DDD7',
        300: '#83C5BE',
        400: '#59A8A2',
        500: '#3F8D88',
        600: '#31706E',
        700: '#2A5B5A',
        800: '#254A49',
        900: '#233E3E',
        950: '#0C0A09',
      },
      blue: {
        50: '#F0FFFD',
        100: '#C7FFFB',
        200: '#8AFEF9',
        300: '#55F6EE',
        400: '#13ECE8',
        500: '#01D0D0',
        600: '#01A5A7',
        700: '#018084',
        800: '#066F74',
        900: '#0A5457',
        950: '#002E33',
      },
      brown: {
        50: '#F8F7EE',
        100: '#F0EDD9',
        200: '#DED6AA',
        300: '#CBBA79',
        400: '#BBA154',
        500: '#AC8E46',
        600: '#93733B',
        700: '#775731',
        800: '#64492F',
        900: '#573E2C',
        950: '#312117',
      },
    },
  },
  plugins: [],
};
