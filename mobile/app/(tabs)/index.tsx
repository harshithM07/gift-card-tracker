import { useState, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCards, useDeleteCard } from "@/hooks/useCards";
import { useLocalCards } from "@/hooks/useLocalCards";
import { useAppStore } from "@/stores/appStore";
import { deleteLocalCard, getLocalCardSecrets } from "@/services/localDb";
import CardTile from "@/components/CardTile";

type AnyCard = {
  id: string;
  merchant: { id: string; name: string; brand_color: string | null };
  card_number_masked: string;
  nickname: string | null;
  balance: number | null;
  is_archived: boolean;
  _source: "remote" | "local";
};

type Section = { title: string; brandColor: string; data: AnyCard[] };

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: remoteCards, isLoading, refetch, isError } = useCards();
  const { cards: localCards, refresh: refreshLocal } = useLocalCards();
  const deleteRemote = useDeleteCard();
  const { user } = useAppStore();

  const allCards = useMemo<AnyCard[]>(() => {
    const remote = (remoteCards ?? []).map((c) => ({ ...c, _source: "remote" as const }));
    const local = localCards.map((c) => ({
      id: c.id,
      merchant: { id: c.merchant_id, name: c.merchant_name, brand_color: c.merchant_color },
      card_number_masked: "••••",
      nickname: c.nickname,
      balance: c.balance,
      is_archived: false,
      _source: "local" as const,
    }));
    return [...remote, ...local];
  }, [remoteCards, localCards]);

  // Filter then group by merchant, sorted alphabetically
  const sections = useMemo<Section[]>(() => {
    const q = search.toLowerCase().trim();
    const filtered = q
      ? allCards.filter(
          (c) =>
            c.merchant.name.toLowerCase().includes(q) ||
            (c.nickname?.toLowerCase().includes(q) ?? false)
        )
      : allCards;

    const map = new Map<string, Section>();
    for (const card of filtered) {
      const key = card.merchant.name;
      if (!map.has(key)) {
        map.set(key, { title: key, brandColor: card.merchant.brand_color ?? "#6B7280", data: [] });
      }
      map.get(key)!.data.push(card);
    }
    // Sort sections alphabetically; within each section sort by balance desc
    return Array.from(map.values())
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((s) => ({
        ...s,
        data: s.data.sort((a, b) => (b.balance ?? -1) - (a.balance ?? -1)),
      }));
  }, [allCards, search]);

  const totalCards = allCards.length;

  function handleRefresh() {
    refetch();
    refreshLocal();
  }

  async function handleLocalCardPress(card: AnyCard) {
    const secrets = await getLocalCardSecrets(card.id);
    Alert.alert(
      card.merchant.name,
      [
        card.nickname ? `"${card.nickname}"` : null,
        `Card: ${secrets.card_number}`,
        secrets.pin ? `PIN: ${secrets.pin}` : null,
        card.balance !== null ? `Balance: $${Number(card.balance).toFixed(2)}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      [
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            Alert.alert("Delete Card", "Permanently delete this local card?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  await deleteLocalCard(card.id);
                  refreshLocal();
                },
              },
            ]),
        },
        { text: "Close", style: "cancel" },
      ]
    );
  }

  function handleCardPress(card: AnyCard) {
    if (card._source === "remote") {
      router.push(`/card/${card.id}`);
    } else {
      handleLocalCardPress(card);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">My Cards</Text>
        <Text className="text-gray-500 text-sm">
          {totalCards} gift card{totalCards !== 1 ? "s" : ""}
        </Text>
      </View>

      <View className="mx-4 mb-3">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-3 px-2 text-base"
            placeholder="Search by merchant or name…"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isLoading && totalCards === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : isError && totalCards === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="wifi-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 mt-3 text-center">
            Could not load cards. {user ? "Check your connection." : "Sign in to sync."}
          </Text>
        </View>
      ) : sections.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="card-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 mt-3 text-center">
            {search ? "No cards match your search." : "No cards yet. Tap Add Card to get started."}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item._source}-${item.id}`}
          renderSectionHeader={({ section }) => (
            <View className="flex-row items-center px-4 pt-4 pb-2">
              <View
                className="w-6 h-6 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: section.brandColor }}
              >
                <Text className="text-white font-bold text-xs">{section.title[0]}</Text>
              </View>
              <Text className="font-semibold text-gray-700 text-sm">{section.title}</Text>
              <Text className="text-gray-400 text-xs ml-2">
                {section.data.length} card{section.data.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View className="px-4">
              <CardTile card={item as any} onPress={() => handleCardPress(item)} />
            </View>
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
