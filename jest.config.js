{
  "testEnvironment": "node",
  "testMatch": [
    "**/__tests__/**/*.js",
    "**/?(*.)+(spec|test).js"
  ],
  "collectCoverageFrom": [
    "lib/**/*.js",
    "!lib/**/*.test.js",
    "!lib/**/*.spec.js"
  ],
  "coverageDirectory": "coverage",
  "coverageReporters": [
    "text",
    "lcov",
    "html"
  ],
  "moduleFileExtensions": [
    "js",
    "json"
  ],
  "setupFilesAfterEnv": [],
  "testTimeout": 10000
}