import js from '@eslint/js';
import globals from 'globals';
export default [js.configs.recommended, { ignores: ['dist/**', 'node_modules/**'] }, { files: ['**/*.{js,jsx}'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.browser, ...globals.node } }, rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z]', argsIgnorePattern: '^_' }] } }];
