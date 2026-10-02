const path = require("node:path");

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.test.js"],
  moduleNameMapper: {
    "^@awb/architecture$": path.join(
      __dirname,
      "../../packages/architecture/rules.ts",
    ),
  },
  transform: {
    "packages/architecture/.+\\.ts$": path.join(__dirname, "jest-ts-transform.cjs"),
  },
};
