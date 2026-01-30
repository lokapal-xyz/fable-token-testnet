import js from "@eslint/js";
import globals from "globals";
import reactDOM from "eslint-plugin-react-dom";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactX from "eslint-plugin-react-x";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
  globalIgnores([
    "dist",
    "packages",
    "target/packages",
    "src/contracts/*",
    "!src/contracts/util.ts",
  ]),
  {
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactDOM.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
      reactX.configs["recommended-typescript"],
      prettier,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRoot: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-misused-promises": [
        "warn",
        { checksVoidReturn: false },
      ],
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "react-hooks/exhaustive-deps": "off", // or "warn"
      "@typescript-eslint/no-unused-vars": [
        "off", // or "warn"
        { argsIgnorePattern: "^_", caughtErrors: "all" },
      ],
      "@typescript-eslint/no-explicit-any": "off", // or "warn"
      "@typescript-eslint/require-await": "off",

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
);
