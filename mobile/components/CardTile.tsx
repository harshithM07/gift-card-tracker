import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Card } from "@/hooks/useCards";

interface Props {
  card: Card & { _source?: "remote" | "local" };
  onPress: () => void;
}

export default function CardTile({ card, onPress }: Props) {
  const brandColor = card.merchant?.brand_color ?? "#6B7280";
  const label = card.nickname ?? card.card_number_masked;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-2 overflow-hidden"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center px-4 py-3">
        <View className="flex-1">
          <Text className="font-medium text-gray-900">{label}</Text>
          {card.nickname && (
            <Text className="text-gray-400 text-xs font-mono mt-0.5">{card.card_number_masked}</Text>
          )}
        </View>

        <View className="items-end">
          {card.balance !== null ? (
            <Text className="font-bold text-gray-900">${Number(card.balance).toFixed(2)}</Text>
          ) : (
            <Text className="text-gray-400 text-sm">—</Text>
          )}
          {card._source === "local" && (
            <View className="flex-row items-center mt-0.5">
              <Ionicons name="phone-portrait-outline" size={10} color="#9CA3AF" />
              <Text className="text-gray-400 text-xs ml-0.5">Local</Text>
            </View>
          )}
        </View>

        <Ionicons name="chevron-forward" size={14} color="#D1D5DB" className="ml-2" />
      </View>
    </TouchableOpacity>
  );
}
