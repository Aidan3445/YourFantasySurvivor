/** @type {import('eslint').Linter.Config} */
const config = {
  env: {
    browser: true,
    es2021: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true
  },
  plugins: [
    '@typescript-eslint',
    'drizzle',
    'eslint-plugin-react-compiler',
    '@typescript-eslint',
    'react',
    '@stylistic/js'
  ],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-indent': [
      'error',
      2
    ],
    'react/jsx-indent-props': [
      'error',
      'first'
    ],
    '@stylistic/js/quote-props': [
      'error',
      'consistent-as-needed'
    ],
    '@stylistic/js/jsx-quotes': [
      'error',
      'prefer-single'
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'indent': [
      'error',
      2,
      { SwitchCase: 1 }
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'react-compiler/react-compiler': 'error',
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports'
      }
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_'
      }
    ],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_'
      }
    ],

    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          attributes: false
        }
      }
    ],
    'drizzle/enforce-delete-with-where': [
      'error',
      {
        drizzleObjectName: [
          'db'
        ]
      }
    ],
    'drizzle/enforce-update-with-where': [
      'error',
      {
        drizzleObjectName: [
          'db'
        ]
      }
    ]
  }
};
module.exports = config;
