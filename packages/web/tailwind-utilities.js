// Our tailwind utilities are originally based off of tailwindcss-rtl.
// https://github.com/20lives/tailwindcss-rtl
const plugin = require('tailwindcss/plugin');

function paddingUtilities({ matchUtilities, theme }) {
  matchUtilities(
    {
      ps: (value) => ({
        paddingInlineStart: value,
      }),
      pe: (value) => ({
        paddingInlineEnd: value,
      }),
    },
    {
      supportsNegativeValues: true,
      values: theme('padding'),
    }
  );
}

function marginUtilities({ matchUtilities, theme }) {
  matchUtilities(
    {
      ms: (value) => ({
        marginInlineStart: value,
      }),
      me: (value) => ({
        marginInlineEnd: value,
      }),
    },
    {
      supportsNegativeValues: true,
      values: theme('margin'),
    }
  );
}

function insetUtilities({ matchUtilities, theme }) {
  matchUtilities(
    {
      start: (value) => ({
        '[dir="rtl"] &, &[dir="rtl"]': {
          right: value,
        },
        '[dir="ltr"] &, &[dir="ltr"]': {
          left: value,
        },
      }),
      end: (value) => ({
        '[dir="rtl"] &, &[dir="rtl"]': {
          left: value,
        },
        '[dir="ltr"] &, &[dir="ltr"]': {
          right: value,
        },
      }),
    },
    {
      supportsNegativeValues: true,
      values: theme('inset'),
    }
  );
}

function textAlignUtilities() {
  return {
    '[dir="rtl"] .text-start': { 'text-align': 'right' },
    '[dir="rtl"] .text-end': { 'text-align': 'left' },
    '[dir="ltr"] .text-end': { 'text-align': 'right' },
    '[dir="ltr"] .text-start': { 'text-align': 'left' },
  };
}

module.exports = plugin((helpers) => {
  const { addUtilities } = helpers;
  paddingUtilities(helpers);
  marginUtilities(helpers);
  insetUtilities(helpers);
  addUtilities(textAlignUtilities());
});
