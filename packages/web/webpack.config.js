const { DefinePlugin } = require('webpack')
const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');

// TODO: define the NEXTAUTH_URL env var here.

module.exports = composePlugins(withNx(), withReact(), (config) => {
  config.plugins ??= []
  config.plugins.push(new DefinePlugin({
    'process.env.NEXTAUTH_URL': '"https://localhost:4300"'
  }))

  return config;
});
