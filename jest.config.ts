import type { Config } from 'jest';

const jestConfig: Config = {
  clearMocks: true,
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
};

export default jestConfig;
