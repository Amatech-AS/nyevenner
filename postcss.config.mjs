/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, /* Her er endringen! */
    autoprefixer: {},
  },
};

export default config;