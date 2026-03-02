import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

async function save(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function get(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function remove(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export const tokenStorage = {
  saveTokens: (accessToken: string, refreshToken: string) =>
    Promise.all([save(ACCESS_TOKEN_KEY, accessToken), save(REFRESH_TOKEN_KEY, refreshToken)]),
  getAccessToken: () => get(ACCESS_TOKEN_KEY),
  getRefreshToken: () => get(REFRESH_TOKEN_KEY),
  clearTokens: () => Promise.all([remove(ACCESS_TOKEN_KEY), remove(REFRESH_TOKEN_KEY)]),
};
