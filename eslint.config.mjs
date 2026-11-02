import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import unicorn from "eslint-plugin-unicorn";

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  unicorn.configs.recommended,
  {
    rules: {
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      complexity: ["error", { max: 20 }],
      "@typescript-eslint/no-unused-vars": "error",
      // Virtual-module declarations are referenced by path so app typechecks see them too.
      "@typescript-eslint/triple-slash-reference": [
        "error",
        { path: "always" },
      ],
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
            camelCase: true,
          },
          ignore: [/DB/i],
        },
      ],
      "unicorn/text-encoding-identifier-case": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/catch-error-name": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/no-nested-ternary": "off",
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      // Tests often need structural stubs / narrowing casts; assertions are
      // acceptable here.
      "@typescript-eslint/consistent-type-assertions": "off",
    },
  },
  {
    ignores: ["node_modules/", "dist/", "scratch/"],
  },
];
