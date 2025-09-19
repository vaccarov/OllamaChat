const { FlatCompat } = require('@eslint/eslintrc');
const nextConfig = require('eslint-config-next');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: path.dirname(require.resolve('eslint-config-next'))
});

module.exports = [
  ...compat.config(nextConfig),
];