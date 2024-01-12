const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');
const utilities = require('./tailwind-utilities.js');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  safelist: ['lexicon-greek', 'lexicon-hebrew'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans"', ...defaultTheme.fontFamily.sans],
        hebrew: ['"SBL-Hebrew"', ...defaultTheme.fontFamily.sans],
        greek: ['"SBL-Greek"', ...defaultTheme.fontFamily.sans],
        mixed: [
          '"SBL-Greek"',
          '"SBL-Hebrew"',
          '"Noto Sans"',
          ...defaultTheme.fontFamily.sans,
        ],
      },
    },
  },
  plugins: [utilities, require('@headlessui/tailwindcss')],
};
