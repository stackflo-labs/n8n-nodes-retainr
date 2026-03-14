/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/nodes', '<rootDir>/credentials'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['nodes/**/*.ts', 'credentials/**/*.ts', '!**/__tests__/**', '!__mocks__/**'],
  coverageThreshold: {
    global: { lines: 80 },
  },
  moduleNameMapper: {
    'isolated-vm': '<rootDir>/__mocks__/isolated-vm.js',
  },
};
