import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  { ignores: ['dist', 'functions/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser, parser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh, '@typescript-eslint': ts },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off'
    }
  }
];
