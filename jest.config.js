module.exports = {
  preset: "ts-jest",
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: ["packages/**/*.ts", "!packages/**/dist/**"],
  verbose: true
};
