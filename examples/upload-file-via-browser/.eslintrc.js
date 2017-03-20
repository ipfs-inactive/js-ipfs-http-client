const config = {
  extends: [
    'standard',
    'standard-react'
  ],
  parser: 'babel-eslint',
  plugins: [
    'promise'
  ],
  rules: {
    'jsx-quotes': [2, 'prefer-double'],
    'linebreak-style': [2, 'unix'],
    'no-nested-ternary': 2,
    'no-unused-vars': 2,
    'no-var': 2,
    'promise/always-return': 1,
    'promise/catch-or-return': 1,
    'promise/no-native': 2
  }
}

module.exports = config
