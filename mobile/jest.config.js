module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["./jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-reanimated|rettime|msw|strict-event-emitter|@mswjs)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@expo/vector-icons$": "<rootDir>/src/__tests__/mocks/expo-vector-icons.js",
    "^@expo/vector-icons/(.*)$": "<rootDir>/src/__tests__/mocks/expo-vector-icons.js",
    "^expo-asset$": "<rootDir>/src/__tests__/mocks/expo-asset.js",
  },
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],
  transform: {
    "^.+\\.(ts|tsx)$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
};
