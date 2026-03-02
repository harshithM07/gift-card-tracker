import { useState, useMemo } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMerchants } from "@/hooks/useMerchants";
import type { Merchant } from "@/hooks/useCards";

interface Props {
  onSelect: (merchant: Merchant) => void;
}

export default function MerchantPicker({ onSelect }: Props) {
  const { data: merchants, isLoading } = useMerchants();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!merchants) return [];
    if (!search.trim()) return merchants;
    return merchants.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  }, [merchants, search]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="mx-4 mb-3">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-3 px-2 text-base"
            placeholder="Search merchants…"
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item: merchant }) => (
          <TouchableOpacity
            className="mx-4 mb-2 bg-white rounded-2xl px-4 py-4 flex-row items-center"
            onPress={() => onSelect(merchant)}
            activeOpacity={0.7}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: (merchant.brand_color ?? "#6B7280") + "22" }}
            >
              <Text
                className="font-bold text-sm"
                style={{ color: merchant.brand_color ?? "#6B7280" }}
              >
                {merchant.name[0]}
              </Text>
            </View>
            <Text className="flex-1 font-medium text-gray-900">{merchant.name}</Text>
            {merchant.has_api && (
              <View className="bg-green-100 rounded-full px-2 py-0.5">
                <Text className="text-green-700 text-xs">API</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" className="ml-2" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-10">
            <Text className="text-gray-400">No merchants found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
