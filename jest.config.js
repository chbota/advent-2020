module.exports = {
  preset: "ts-jest",
  clearMocks: true,
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.[jt]s?(x)",
    "<rootDir>/src/**/?(*.)+(spec|test).[tj]s?(x)",
  ],
};
