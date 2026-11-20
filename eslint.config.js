import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

export default [
    {
        ignores: [
            'node_modules/**',
            '.nuxt/**',
            '.output/**',
            'dist/**',
            'coverage/**',
            '.DS_Store',
        ],
    },
    js.configs.recommended,
    ...compat.extends('airbnb-base'),
    ...pluginVue.configs['flat/essential'],
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            indent: ['error', 4, { ignoreComments: true, SwitchCase: 1 }],
            semi: ['error', 'always'],
            'no-use-before-define': 0,
            'comma-dangle': 0,
            'spaced-comment': 0,
            'no-new': 0,
            'no-multi-spaces': ['error', { ignoreEOLComments: true }],
            'no-plusplus': 0,
            'wrap-iife': 0,
            'no-underscore-dangle': 0,
            'one-var': 0,
            'max-len': ['error', {
                code: 120,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
                ignorePattern: 'class=|:style=|:description=|findOneAndUpdate',
            }],
            'no-alert': 'off',
            'no-restricted-syntax': 'off',
            'space-before-function-paren': ['error', 'never'],
            'no-param-reassign': ['error', { props: false }],
            'no-console': 'off',
            'no-debugger': 'warn',
            // Nuxt stellt ref, computed, defineEventHandler und weitere Helfer automatisch bereit.
            'no-undef': 'off',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'import/extensions': 'off',
            'import/no-unresolved': 'off',
            'import/prefer-default-export': 'off',
            'vue/multi-word-component-names': ['error', {
                ignores: ['index', 'default', 'admin', 'plain', 'embed', 'login', 'boats', 'bookings', 'settings'],
            }],
            'vue/html-indent': ['error', 4],
            'vue/script-indent': ['error', 4, { baseIndent: 0, switchCase: 1 }],
        },
    },
    {
        files: ['**/*.vue'],
        rules: {
            indent: 'off',
        },
    },
    {
        files: ['*.config.js', 'eslint.config.js', 'scripts/**', 'server/**'],
        rules: {
            'import/no-extraneous-dependencies': 'off',
            'no-restricted-syntax': 'off',
            'no-await-in-loop': 'off',
        },
    },
];
