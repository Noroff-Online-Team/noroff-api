import type { JestConfigWithTsJest } from "ts-jest"

const jestConfig: JestConfigWithTsJest = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 20000,
  setupFilesAfterEnv: ["<rootDir>/src/test-utils/server.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  workerIdleMemoryLimit: "512MB",
  modulePathIgnorePatterns: ["<rootDir>/dist"]
}

export default jestConfig
