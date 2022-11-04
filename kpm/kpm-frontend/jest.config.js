/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(scss|css|jpg|png|gif|svg|webp|webm|mp4|mov)$": "<rootDir>/__mocks__/ignore.mock.ts",
  },
};
