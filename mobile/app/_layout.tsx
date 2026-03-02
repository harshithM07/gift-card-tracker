import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/stores/appStore";
import { initLocalDb } from "@/services/localDb";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function AuthGate() {
  const { loadUser } = useAuth();
  const { user, isAuthLoaded } = useAppStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadUser();
    initLocalDb();
  }, [loadUser]);

  useEffect(() => {
    if (!isAuthLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isAuthLoaded, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="card/[id]" options={{ headerShown: true, title: "Card Details", presentation: "card" }} />
      <Stack.Screen name="admin" options={{ headerShown: true, title: "Admin" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthGate />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
