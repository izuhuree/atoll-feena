import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import globals from 'globals';

export default [{ ignores: ['lib'] }, js.configs.recommended, { files: ['src/**/*.ts'], languageOptions: { parser, globals: globals.node, parserOptions: { project: './tsconfig.json' } }, plugins: { '@typescript-eslint': ts }, rules: { 'no-unused-vars': 'off', '@typescript-eslint/no-unused-vars': 'off' } }];
