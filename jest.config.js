export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  clearMocks: true,

  collectCoverage: true,

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/generated/prisma/**',
    '!src/**/*.test.ts',
    '!src/index.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
