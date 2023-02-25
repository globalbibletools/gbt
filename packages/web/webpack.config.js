const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  if (config.devServer) {
    config.devServer.proxy = {
      '/api': 'http://localhost:4300'
   }
  }

  return config;
});
