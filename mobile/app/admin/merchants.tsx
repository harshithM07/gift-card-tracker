import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { adminApi } from "@/services/api";
import type { Merchant } from "@/hooks/useCards";

interface MerchantForm {
  name: string;
  slug: string;
  logo_url: string;
  website_url: string;
  balance_check_url: string;
  has_api: boolean;
  api_adapter: string;
  brand_color: string;
  is_active: boolean;
}

const emptyForm: MerchantForm = {
  name: "",
  slug: "",
  logo_url: "",
  website_url: "",
  balance_check_url: "",
  has_api: false,
  api_adapter: "",
  brand_color: "#000000",
  is_active: true,
};

export default function AdminMerchantsScreen() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Merchant | null>(null);
  const [form, setForm] = useState<MerchantForm>(emptyForm);

  const { data: merchants, isLoading } = useQuery({
    queryKey: ["admin-merchants"],
    queryFn: async () => {
      const { data } = await adminApi.listMerchants();
      return data as Merchant[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => adminApi.createMerchant(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-merchants"] }); qc.invalidateQueries({ queryKey: ["merchants"] }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => adminApi.updateMerchant(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-merchants"] }); qc.invalidateQueries({ queryKey: ["merchants"] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteMerchant(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-merchants"] }); qc.invalidateQueries({ queryKey: ["merchants"] }); },
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(m: Merchant) {
    setEditing(m);
    setForm({
      name: m.name,
      slug: m.slug,
      logo_url: m.logo_url ?? "",
      website_url: m.website_url ?? "",
      balance_check_url: m.balance_check_url ?? "",
      has_api: m.has_api,
      api_adapter: (m as any).api_adapter ?? "",
      brand_color: m.brand_color ?? "#000000",
      is_active: m.is_active,
    });
    setShowModal(true);
  }

  async function handleSave() {
    const payload = {
      ...form,
      logo_url: form.logo_url || null,
      website_url: form.website_url || null,
      balance_check_url: form.balance_check_url || null,
      api_adapter: form.api_adapter || null,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setShowModal(false);
  }

  function handleDelete(m: Merchant) {
    Alert.alert("Delete Merchant", `Delete "${m.name}"? This may affect existing cards.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(m.id) },
    ]);
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-900">Merchants ({merchants?.length ?? 0})</Text>
        <TouchableOpacity className="bg-primary rounded-xl px-4 py-2" onPress={openCreate}>
          <Text className="text-white font-semibold">+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={merchants}
          keyExtractor={(m) => m.id}
          renderItem={({ item: m }) => (
            <View className="mx-4 mb-2 bg-white rounded-2xl px-4 py-4 flex-row items-center">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: (m.brand_color ?? "#6B7280") + "33" }}
              >
                <Text className="font-bold text-xs" style={{ color: m.brand_color ?? "#6B7280" }}>
                  {m.name[0]}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">{m.name}</Text>
                <Text className="text-gray-400 text-xs">{m.slug}{m.has_api ? " • API" : ""}{!m.is_active ? " • Inactive" : ""}</Text>
              </View>
              <TouchableOpacity onPress={() => openEdit(m)} className="mr-3">
                <Ionicons name="pencil-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(m)}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
          <View className="px-4 pt-6 pb-10">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">
                {editing ? "Edit Merchant" : "Add Merchant"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {(["name", "slug", "logo_url", "website_url", "balance_check_url", "api_adapter", "brand_color"] as const).map((field) => (
              <View key={field} className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field.replace(/_/g, " ")}
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
                  value={form[field]}
                  onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
                  autoCapitalize="none"
                />
              </View>
            ))}

            <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-4 mb-4">
              <Text className="font-medium text-gray-900">Has API</Text>
              <Switch
                value={form.has_api}
                onValueChange={(v) => setForm((f) => ({ ...f, has_api: v }))}
                trackColor={{ true: "#2563EB" }}
              />
            </View>

            <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-4 mb-6">
              <Text className="font-medium text-gray-900">Active</Text>
              <Switch
                value={form.is_active}
                onValueChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                trackColor={{ true: "#2563EB" }}
              />
            </View>

            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center"
              onPress={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  {editing ? "Save Changes" : "Create Merchant"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}
