import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCard, useCheckBalance, useUpdateCard, useDeleteCard } from "@/hooks/useCards";

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: card, isLoading, refetch } = useCard(id);
  const checkBalance = useCheckBalance();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();

  const [showSecrets, setShowSecrets] = useState(false);
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");

  if (isLoading || !card) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  async function handleCheckBalance() {
    const { data } = await checkBalance.mutateAsync(id);
    if (data.check_url) {
      Alert.alert(
        "Check Balance",
        `${card!.merchant.name} requires you to check manually.`,
        [
          { text: "Open Website", onPress: () => Linking.openURL(data.check_url) },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } else {
      refetch();
    }
  }

  async function handleSaveBalance() {
    const val = parseFloat(balanceInput);
    if (isNaN(val) || val < 0) {
      Alert.alert("Invalid", "Enter a valid balance amount.");
      return;
    }
    await updateCard.mutateAsync({ id, data: { balance: val } });
    setEditingBalance(false);
    refetch();
  }

  async function handleArchive() {
    Alert.alert("Archive Card", "Archive this card? You can restore it from settings.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Archive",
        onPress: async () => {
          await updateCard.mutateAsync({ id, data: { is_archived: true } });
          router.back();
        },
      },
    ]);
  }

  async function handleDelete() {
    Alert.alert("Delete Card", "Permanently delete this card? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCard.mutateAsync(id);
          router.back();
        },
      },
    ]);
  }

  const brandColor = card.merchant.brand_color ?? "#2563EB";

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Card header */}
      <View className="mx-4 mt-4 rounded-2xl p-6 mb-4" style={{ backgroundColor: brandColor }}>
        <Text className="text-white text-xl font-bold mb-1">{card.merchant.name}</Text>
        {card.nickname && <Text className="text-white/80 text-sm mb-4">{card.nickname}</Text>}
        <Text className="text-white/60 text-xs mb-1">Card Number</Text>
        <Text className="text-white font-mono text-lg tracking-wider">
          {showSecrets ? card.card_number : card.card_number_masked}
        </Text>
        {(showSecrets && card.pin) && (
          <>
            <Text className="text-white/60 text-xs mt-3 mb-1">PIN</Text>
            <Text className="text-white font-mono text-lg">{card.pin}</Text>
          </>
        )}
        <TouchableOpacity
          className="mt-4 self-start"
          onPress={() => setShowSecrets((v) => !v)}
        >
          <Text className="text-white/80 text-sm">
            {showSecrets ? "Hide details" : "Show card number & PIN"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Balance */}
      <View className="mx-4 bg-white rounded-2xl p-5 mb-4">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Balance</Text>
        {editingBalance ? (
          <View className="flex-row items-center gap-3">
            <TextInput
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base"
              value={balanceInput}
              onChangeText={setBalanceInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              autoFocus
            />
            <TouchableOpacity
              className="bg-primary rounded-xl px-4 py-3"
              onPress={handleSaveBalance}
            >
              <Text className="text-white font-semibold">Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingBalance(false)}>
              <Ionicons name="close" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-gray-900">
              {card.balance !== null ? `$${Number(card.balance).toFixed(2)}` : "Unknown"}
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="bg-gray-100 rounded-xl px-3 py-2 flex-row items-center"
                onPress={() => {
                  setBalanceInput(card.balance !== null ? String(card.balance) : "");
                  setEditingBalance(true);
                }}
              >
                <Ionicons name="pencil-outline" size={16} color="#6B7280" />
                <Text className="ml-1 text-gray-600 text-sm">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-primary/10 rounded-xl px-3 py-2 flex-row items-center"
                onPress={handleCheckBalance}
                disabled={checkBalance.isPending}
              >
                {checkBalance.isPending ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <>
                    <Ionicons name="refresh-outline" size={16} color="#2563EB" />
                    <Text className="ml-1 text-primary text-sm">Check</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        {card.balance_updated_at && (
          <Text className="text-gray-400 text-xs mt-2">
            Updated {new Date(card.balance_updated_at).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Notes */}
      {card.notes && (
        <View className="mx-4 bg-white rounded-2xl p-5 mb-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</Text>
          <Text className="text-gray-700">{card.notes}</Text>
        </View>
      )}

      {/* Actions */}
      <View className="mx-4 mb-8">
        <TouchableOpacity
          className="flex-row items-center bg-white rounded-2xl px-4 py-4 mb-3"
          onPress={handleArchive}
        >
          <Ionicons name="archive-outline" size={20} color="#6B7280" />
          <Text className="ml-3 text-gray-700">Archive Card</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center bg-white rounded-2xl px-4 py-4"
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text className="ml-3 text-red-500">Delete Card</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
