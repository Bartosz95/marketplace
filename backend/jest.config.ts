import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Look for tests in these file patterns
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],

  // Optional: collect coverage
  collectCoverage: true,
  coverageDirectory: "coverage",

  // Optional: module resolution if you use tsconfig paths
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
