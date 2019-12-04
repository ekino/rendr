module.exports = {
  preset: "ts-jest",
  testMatch: ["**/*.test.ts(|x)"],
  collectCoverageFrom: ["packages/**/*.ts", "!packages/**/dist/**"],
  verbose: true
};
