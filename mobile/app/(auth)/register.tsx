import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email.trim() || !password) return;
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password);
    } catch (err: any) {
      const message = err?.response?.data?.detail ?? "Registration failed. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Create account</Text>
        <Text className="text-gray-500 mb-8">Start tracking your gift cards</Text>

        <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base"
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 8 characters"
          secureTextEntry
        />

        <Text className="text-sm font-medium text-gray-700 mb-1">Confirm Password</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-base"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="••••••••"
          secureTextEntry
        />

        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Create Account</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Already have an account? </Text>
          <Link href="/(auth)/login">
            <Text className="text-primary font-semibold">Sign in</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
