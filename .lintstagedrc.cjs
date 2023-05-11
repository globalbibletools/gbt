module.exports = {
  '**/*.{js,ts,tsx}': [
    'nx affected:lint --fix --files',
    'nx format:write --files',
  ],
  '!**/*.{js,ts,tsx}': 'nx format write --files',
};
