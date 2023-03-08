//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require('@nrwl/next/plugins/with-nx');


/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  async rewrites() {
    let apiURL = process.env['API_URL']

    if (!apiURL) {
      const vercelURL = process.env['VERCEL_URL']
      apiURL = `https://${vercelURL.replace('gloss-translation', 'gloss-translation-api')}`
    }
    console.log(apiURL)

    return [
      {
        "source": "/api/:match*",
        "destination": `${apiURL}/api/:match*`
      },
    ]
  },
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
};

module.exports = withNx(nextConfig);
