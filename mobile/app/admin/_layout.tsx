import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";

export default function AdminLayout() {
  const { user } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (user && !user.is_admin) {
      router.replace("/(tabs)");
    }
  }, [user, router]);

  return <Stack screenOptions={{ headerShown: true }} />;
}
