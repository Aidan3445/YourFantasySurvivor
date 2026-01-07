import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';
import drizzlePlugin from 'eslint-plugin-drizzle';
import stylisticJs from '@stylistic/eslint-plugin-js';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import vitest from 'eslint-plugin-vitest';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        }
      },
      globals: {
        NodeJS: 'readonly',
        React: 'readonly',
        JSX: 'readonly',
      },
    },
  },
  {
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-compiler': reactCompilerPlugin,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      'drizzle': drizzlePlugin,
      '@stylistic/js': stylisticJs,
      'no-relative-import-paths': noRelativeImportPaths,
      vitest,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...vitest.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-indent': ['error', 2],
      'react/jsx-indent-props': ['error', 'first'],
      '@stylistic/js/quote-props': ['error', 'consistent-as-needed'],
      '@stylistic/js/jsx-quotes': ['error', 'prefer-single'],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'react-compiler/react-compiler': 'error',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      'drizzle/enforce-delete-with-where': [
        'error',
        {
          drizzleObjectName: ['db'],
        },
      ],
      'drizzle/enforce-update-with-where': [
        'warn',
        {
          drizzleObjectName: ['db'],
        },
      ],
      'no-relative-import-paths/no-relative-import-paths': [
        'warn',
        {
          allowSameFolder: false,
          rootDir: 'src',
          prefix: '~',
        },
      ],
      '@typescript-eslint/unbound-method': 'off',
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },
);
