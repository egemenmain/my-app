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
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  // Jest test dosyaları için özel ayar
  {
    files: ["**/__tests__/**/*.{js,jsx,ts,tsx}", "**/*.test.{js,jsx,ts,tsx}"],
    env: {
      jest: true,
    },
    rules: {
      "no-undef": "off"
    }
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      // Prevent undefined variables (catches curly brace string props)
      "no-undef": "warn",

      // Prevent unused variables
      "no-unused-vars": "warn",

      // Custom rule to catch JSX string prop issues (only for literal strings, not template literals)
      "no-restricted-syntax": [
        "warn",
        {
          "selector": "JSXAttribute[name.name=/^(filename|fileName|downloadName|exportName)$/] > JSXExpressionContainer > Literal[raw=/^\\{.*\\}$/]",
          "message": "String props like filename should use string literals, not curly braces. Use filename=\"value\" instead of filename={value}."
        },
        {
          "selector": "CallExpression[callee.name=/^download(JSON|Csv|Xlsx|Pdf)$/] > Literal[raw=/^\\{.*\\}$/]",
          "message": "Download function arguments should be string literals, not curly braces. Use downloadJSON(\"filename.json\") instead of downloadJSON({filename.json})."
        }
      ]
    }
  }
];

export default eslintConfig;
