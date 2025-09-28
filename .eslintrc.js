module.exports = {
  root: true,
  extends: ['universe/native'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
