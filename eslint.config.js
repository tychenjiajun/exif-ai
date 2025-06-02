// eslint.config.js
import pluginJs from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';

import * as importX from 'eslint-plugin-import-x';
import pluginPromise from 'eslint-plugin-promise';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import sonarjs from 'eslint-plugin-sonarjs';

import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

export default [
  // Global ignores
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'dist-local/**',
      'out/**',
      '.vercel/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
    ],
  },

  // Base configs for all files
  pluginJs.configs.recommended,
  prettierRecommended,
  eslintPluginUnicorn.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  pluginPromise.configs['flat/recommended'],
  sonarjs.configs.recommended,

  // TypeScript configs with type checking - only for src directory
  ...tseslint.configs.strictTypeChecked.map(config => ({
    ...config,
    files: ['src/**/*.{ts,tsx}'],
  })),
  ...tseslint.configs.stylisticTypeChecked.map(config => ({
    ...config,
    files: ['src/**/*.{ts,tsx}'],
  })),

  // TypeScript files configuration (only for src directory)
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'unicorn/no-nested-ternary': 'off',
      'unicorn/no-nested-conditional': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-spread': 'off',
      'unicorn/prefer-global-this': 'off',
      'unicorn/number-literal-case': 'off',
      'unicorn/catch-error-name': 'off',
      'unicorn/no-object-as-default-parameter': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/no-useless-undefined': 'off',
    },
    settings: {
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        }),
      ],
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        projectFolderIgnoreList: [
          'node_modules/',
          'dist/',
          'dist-local',
          '.next/',
        ],
        warnOnUnsupportedTypeScriptVersion: false,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  },

  // JavaScript files (without TypeScript-specific rules)
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  // Test files configuration (only in src directory)
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
    rules: {
      // Allow test-specific patterns
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'sonarjs/no-duplicate-string': 'off',
    },
  },
];
