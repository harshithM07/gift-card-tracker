import { View, Text, TouchableOpacity, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/stores/appStore";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { storagePreference, setStoragePreference } = useAppStore();
  const router = useRouter();

  function handleLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: logout },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Settings</Text>

        {/* Account section */}
        <View className="bg-white rounded-2xl mb-4 overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Account</Text>
          </View>
          {user ? (
            <>
              <View className="px-4 py-4 flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                  <Text className="text-white font-bold text-lg">
                    {user.email[0].toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">{user.email}</Text>
                  {user.is_admin && (
                    <Text className="text-xs text-primary">Administrator</Text>
                  )}
                </View>
              </View>
              {user.is_admin && (
                <TouchableOpacity
                  className="px-4 py-4 flex-row items-center border-t border-gray-100"
                  onPress={() => router.push("/admin/merchants")}
                >
                  <Ionicons name="storefront-outline" size={20} color="#6B7280" />
                  <Text className="ml-3 text-gray-700 flex-1">Manage Merchants</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="px-4 py-4 flex-row items-center border-t border-gray-100"
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text className="ml-3 text-red-500 flex-1">Log Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              className="px-4 py-4 flex-row items-center"
              onPress={() => router.push("/(auth)/login")}
            >
              <Ionicons name="person-outline" size={20} color="#2563EB" />
              <Text className="ml-3 text-primary font-medium flex-1">Sign in to sync cards</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Storage preferences */}
        <View className="bg-white rounded-2xl mb-4 overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Storage</Text>
          </View>
          <View className="px-4 py-4 flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="font-medium text-gray-900">Save cards locally by default</Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                Cards won't be uploaded to the server
              </Text>
            </View>
            <Switch
              value={storagePreference === "local"}
              onValueChange={(val) => setStoragePreference(val ? "local" : "remote")}
              trackColor={{ true: "#2563EB" }}
            />
          </View>
        </View>

        {/* About */}
        <View className="bg-white rounded-2xl overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-100">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide">About</Text>
          </View>
          <View className="px-4 py-4">
            <Text className="text-gray-700">Gift Card Tracker</Text>
            <Text className="text-gray-400 text-sm">Version 1.0.0</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
