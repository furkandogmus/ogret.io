import "whatwg-fetch";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: jest.fn(),
  Stack: {
    Screen: () => null,
  },
  Tabs: {
    Screen: () => null,
  },
}));

jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return {
    Image: (props) => <View {...props} />,
  };
});

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => () => {}),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  useNetInfo: jest.fn(() => ({ isConnected: true })),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Error: "error", Warning: "warning" },
}));

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock("react-native-gesture-handler", () => {
  const { View } = require("react-native");
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    TapGestureHandler: View,
    LongPressGestureHandler: View,
  };
});

