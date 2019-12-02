module.exports = {
  setupFilesAfterEnv: ['<rootDir>setup-tests.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native-community|react-native-elements)',
  ],
  preset: 'react-native',
};
