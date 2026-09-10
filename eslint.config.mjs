// eslint.config.mjs
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      '.agents/**',
      'config/**',
      'configs/**',
      'modules/**',
      '**/*.config.*',
      '**/*.module.*',
      'dist',
      'build',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx,js,jsx,mjs}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    plugins: {
      'import-x': importX,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    rules: {
      'import-x/no-unresolved': 'error',
      'import-x/named': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: String.raw`Literal[value=/\d+px/]`,
          message: 'Use rem-based responsive units instead of px.',
        },
        {
          selector: String.raw`TemplateElement[value.raw=/\d+px/]`,
          message: 'Use rem-based responsive units instead of px.',
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.ts', 'src/app/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration[declaration.type="Identifier"]',
          message: 'Use export { Component as default } from ... for route screen adapters.',
        },
      ],
    },
  },
  eslintConfigPrettier,
]);
