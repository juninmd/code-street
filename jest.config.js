module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: ['/node_modules/(?!@google/genai|p-retry)'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};
