const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');
const utilities = require('./tailwind-utilities.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        hebrew: ['"SBL-Hebrew"', '"Times New Roman"', 'serif'],
        greek: ['"SBL-Greek"', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [utilities, require('@headlessui/tailwindcss')],
};
