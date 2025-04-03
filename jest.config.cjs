const nextJest = require('next/jest')

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  dir: './',
})
 
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "ts-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(lucide-react|react-icons)/)",
  ],
  moduleNameMapper: {
    "^lucide-react$": "<rootDir>/node_modules/lucide-react/dist/cjs/lucide-react.js",
    "^@/(.*)$": "<rootDir>/$1", 
    '^app/(.*)$': '<rootDir>/app/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
}
 
module.exports = createJestConfig(config)