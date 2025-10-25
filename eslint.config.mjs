import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "**/src/generated/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/*.config.js",
      "**/*.config.mjs",
    ],
  },
  {
    rules: {
      // All rules enabled as errors for proper code quality
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-this-alias": "error",
      "@typescript-eslint/no-unused-expressions": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
      "react/no-unescaped-entities": "error",
      "@next/next/no-img-element": "error",
      "@next/next/no-html-link-for-pages": "error",
      "prefer-const": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

export default eslintConfig;
