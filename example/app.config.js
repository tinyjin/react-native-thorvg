module.exports = ({ config }) =>
  process.env.EXAMPLES_BASE_URL
    ? {
        ...config,
        experiments: {
          ...config.experiments,
          baseUrl: process.env.EXAMPLES_BASE_URL,
        },
      }
    : config;
