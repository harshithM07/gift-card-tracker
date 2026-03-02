import { useCallback } from "react";
import { authApi } from "@/services/api";
import { tokenStorage } from "@/services/secureStore";
import { useAppStore } from "@/stores/appStore";

export function useAuth() {
  const { user, setUser, setAuthLoaded } = useAppStore();

  const loadUser = useCallback(async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setAuthLoaded(true);
        return;
      }
      const { data } = await authApi.me();
      setUser(data);
    } catch {
      await tokenStorage.clearTokens();
      setUser(null);
    } finally {
      setAuthLoaded(true);
    }
  }, [setUser, setAuthLoaded]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await authApi.login(email, password);
      await tokenStorage.saveTokens(data.access_token, data.refresh_token);
      const me = await authApi.me();
      setUser(me.data);
    },
    [setUser]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const { data } = await authApi.register(email, password);
      await tokenStorage.saveTokens(data.access_token, data.refresh_token);
      const me = await authApi.me();
      setUser(me.data);
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // ignore
    } finally {
      await tokenStorage.clearTokens();
      setUser(null);
    }
  }, [setUser]);

  return { user, login, register, logout, loadUser };
}
