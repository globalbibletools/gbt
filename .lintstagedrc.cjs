module.exports = {
  '**/*.{js,ts,tsx}': [
    'nx affected:lint --fix --files',
    'nx format:write --files',
  ],
  '**/*.prisma': 'nx run db:prisma format',
  '!**/*.{js,ts,tsx}': 'nx format write --files',
};
