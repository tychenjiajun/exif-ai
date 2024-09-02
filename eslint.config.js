import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginPromise from "eslint-plugin-promise";
import nodePlugin from "eslint-plugin-node";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  nodePlugin.configs["flat/recommended-script"],
  pluginPromise.configs["flat/recommended"],
  eslintPluginUnicorn.configs.recommended,
  ...tseslint.configs.recommended,
];
