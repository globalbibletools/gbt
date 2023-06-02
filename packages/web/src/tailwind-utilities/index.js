// Our tailwind utilities are originally based off of tailwindcss-rtl.
// https://github.com/20lives/tailwindcss-rtl
const plugin = require('tailwindcss/plugin');

const paddingUtilities = require('./paddingUtilities');
const marginUtilities = require('./marginUtilities');
const insetUtilities = require('./insetUtilities');
const textAlignUtilities = require('./textAlignUtilities');

module.exports = plugin((helpers) => {
  const { addUtilities, theme, variants } = helpers;
  paddingUtilities(helpers);
  marginUtilities(helpers);
  insetUtilities(helpers);
  addUtilities(textAlignUtilities(helpers), variants('textAlign'));
});
