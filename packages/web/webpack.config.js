const { DefinePlugin } = require('webpack');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  config.plugins ??= [];
  config.plugins.push(
    new DefinePlugin({
      // Generate the API_URL for vercel preview environments since these are unique for each branch.
      'process.env.API_URL': JSON.stringify(
        process.env.VERCEL_ENV === 'preview'
          ? `https://api-git-${process.env.VERCEL_GIT_COMMIT_REF.replace(
              '/',
              '-'
            )}-global-bible-tools.vercel.app`
          : process.env.API_URL
      ),
    })
  );

  return config;
});
