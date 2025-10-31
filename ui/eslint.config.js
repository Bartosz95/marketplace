// eslint.config.js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Extend the recommended Next.js configuration
  nextVitals,

  // Override default ignores of eslint-config-next (optional, if you need to customize)
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // Add custom rules or configurations for specific file types (optional)
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    rules: {
      // Example: enforce semicolons and prefer const
      semi: "error",
      "prefer-const": "error",
      // Add or override other rules as needed
    },
    // Add plugins and settings for React if not already covered by nextVitals
    // For example, if you need specific React rules not in nextVitals:
    // plugins: {
    //   react: reactPlugin, // Assuming reactPlugin is imported
    // },
    // settings: {
    //   react: {
    //     version: 'detect', // Automatically detect React version
    //   },
    // },
  },
]);
