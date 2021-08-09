module.exports = {
  'env': {
    'commonjs': true,
    'es6': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:markdown/recommended'
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parserOptions': {
    'ecmaVersion': 8
  },
  'rules': {
    'no-unused-vars': ['off'],
    'no-undef': ['off'],
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ]
  }
}
