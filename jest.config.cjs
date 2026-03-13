/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/__tests__/**', '!src/__mocks__/**'],
  coverageThreshold: {
    global: { lines: 80 },
  },
  moduleNameMapper: {
    'isolated-vm': '<rootDir>/src/__mocks__/isolated-vm.js',
  },
};
