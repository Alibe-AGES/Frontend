// eslint.config.mjs
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      'config/**',
      'configs/**',
      'modules/**',
      '**/*.config.*',
      '**/*.module.*',
      'agents/**',
      'node_modules/**',
      'dist',
      'build',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
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
        projectService: true,
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
    },
  },
  eslintConfigPrettier,
]);
