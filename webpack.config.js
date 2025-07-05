const { withExpo } = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await withExpo(env, argv);

  config.devServer = {
    ...(config.devServer || {}),
    headers: {
      ...(config.devServer?.headers || {}),
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  };

  return config;
};
