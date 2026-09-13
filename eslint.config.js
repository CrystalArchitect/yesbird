// ESLint flat config for JavaScript/TypeScript linting (ADM-001)
// Compatible with ESLint v9.0.0+
// Migration guide: https://eslint.org/docs/latest/use/configure/migration-guide

import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/", "dist/", "build/", ".next/"]
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "indent": ["error", 2],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "semi": ["error", "always"],
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "eqeqeq": ["warn", "always"],
      "curly": ["warn", "all"]
    }
  }
];
