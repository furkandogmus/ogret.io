import { render, act, waitFor, fireEvent } from "@testing-library/react-native";
import { Text, TouchableOpacity } from "react-native";
import * as SecureStore from "expo-secure-store";
import { AuthProvider, useAuth } from "../../providers/AuthProvider";

jest.mock("axios");
const mockAxios = require("axios");

const mockUser = {
  id: "user-1",
  email: "test@ogret.io",
  fullName: "Test User",
  role: "STUDENT",
  phone: "+905551234567",
  online: false,
  verified: true,
  profileComplete: true,
  identityVerified: false,
};

function TestConsumer() {
  const { user, isAuthenticated, loading, login, register, logout } = useAuth();
  if (loading) return <Text testID="loading">Loading...</Text>;
  return (
    <>
      <Text testID="auth-status">{isAuthenticated ? "logged-in" : "logged-out"}</Text>
      <Text testID="user-name">{user?.fullName ?? "none"}</Text>
      <TouchableOpacity testID="btn-login" onPress={() => login("test@ogret.io", "test-password-123").catch(() => undefined)}>
        <Text>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="btn-register"
        onPress={() =>
          register({
            email: "new@ogret.io",
            phone: "+905551234567",
            password: "test-password-123",
            fullName: "New User",
            role: "TUTOR",
          })
        }
      >
        <Text>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="btn-logout" onPress={() => logout()}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AuthProvider", () => {
  it("shows logged-out when no token stored", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByTestId("loading")).toBeTruthy();
    });
    await waitFor(() => {
      expect(getByTestId("auth-status").props.children).toBe("logged-out");
    });
  });

  it("auto-logs in when token exists and fetches user", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("existing-token");
    mockAxios.get.mockResolvedValue({ data: mockUser });
    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByTestId("auth-status").props.children).toBe("logged-in");
    });
    expect(getByTestId("user-name").props.children).toBe("Test User");
    expect(mockAxios.get).toHaveBeenCalledWith("/users/me");
  });

  it("login stores tokens and fetches user", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    mockAxios.post.mockResolvedValue({
      data: { accessToken: "access-login", refreshToken: "refresh-login" },
    });
    mockAxios.get.mockResolvedValue({ data: mockUser });
    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByTestId("auth-status").props.children).toBe("logged-out");
    });
    await act(async () => {
      fireEvent.press(getByTestId("btn-login"));
    });
    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("accessToken", "access-login");
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("refreshToken", "refresh-login");
      expect(getByTestId("auth-status").props.children).toBe("logged-in");
      expect(getByTestId("user-name").props.children).toBe("Test User");
    });
  });

  it("register creates a session immediately", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    mockAxios.post.mockResolvedValue({
      data: { accessToken: "access-register", refreshToken: "refresh-register", user: mockUser },
    });
    mockAxios.get.mockResolvedValue({ data: mockUser });
    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByTestId("auth-status").props.children).toBe("logged-out");
    });
    await act(async () => {
      fireEvent.press(getByTestId("btn-register"));
    });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("accessToken", "access-register");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("refreshToken", "refresh-register");
    expect(getByTestId("auth-status").props.children).toBe("logged-in");
  });

  it("logout clears tokens and user", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("existing-token");
    mockAxios.get.mockResolvedValue({ data: mockUser });
    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByTestId("auth-status").props.children).toBe("logged-in");
    });
    await act(async () => {
      fireEvent.press(getByTestId("btn-logout"));
    });
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("accessToken");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("refreshToken");
    expect(getByTestId("auth-status").props.children).toBe("logged-out");
    expect(getByTestId("user-name").props.children).toBe("none");
  });

  it("login failure does not change state", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    mockAxios.post.mockRejectedValue(new Error("Invalid credentials"));
    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByTestId("auth-status").props.children).toBe("logged-out");
    });
    await act(async () => {
      fireEvent.press(getByTestId("btn-login"));
    });
    expect(getByTestId("auth-status").props.children).toBe("logged-out");
  });

  it("calls getMe only once on mount with stored token", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("existing-token");
    mockAxios.get.mockResolvedValue({ data: mockUser });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });
    expect(mockAxios.get).toHaveBeenCalledWith("/users/me");
  });
});
