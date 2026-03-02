import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCreateCard } from "@/hooks/useCards";
import { useAppStore } from "@/stores/appStore";
import { saveLocalCard } from "@/services/localDb";
import { scanApi } from "@/services/api";
import MerchantPicker from "@/components/MerchantPicker";
import ScanModal from "@/components/ScanModal";
import type { Merchant } from "@/hooks/useCards";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

type Step = "merchant" | "details";

export default function AddCardScreen() {
  const router = useRouter();
  const createCard = useCreateCard();
  const { storagePreference, user } = useAppStore();

  const [step, setStep] = useState<Step>("merchant");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [saveLocally, setSaveLocally] = useState(storagePreference === "local");
  const [scanning, setScanning] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleScan(imageUri: string) {
    setShowScanModal(false);
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append("file", { uri: imageUri, name: "scan.jpg", type: "image/jpeg" } as any);
      const { data } = await scanApi.scanImage(formData);

      if (data.card_number) setCardNumber(data.card_number);
      if (data.pin) setPin(data.pin);

      // If merchant was extracted and we don't have one selected yet, show suggestion
      if (data.merchant && !selectedMerchant) {
        Alert.alert("Merchant detected", `We detected: "${data.merchant}". Please select it from the list.`);
      }
    } catch {
      Alert.alert("Scan failed", "Could not extract card details. Please enter manually.");
    } finally {
      setScanning(false);
    }
  }

  async function handleSave() {
    if (!selectedMerchant || !cardNumber.trim()) return;
    setSaving(true);
    try {
      if (saveLocally || !user) {
        await saveLocalCard({
          id: uuidv4(),
          merchant_id: selectedMerchant.id,
          merchant_name: selectedMerchant.name,
          merchant_color: selectedMerchant.brand_color,
          nickname: nickname || null,
          notes: null,
          balance: null,
          balance_updated_at: null,
          card_number: cardNumber.trim(),
          pin: pin.trim() || undefined,
        });
      } else {
        await createCard.mutateAsync({
          merchant_id: selectedMerchant.id,
          card_number: cardNumber.trim(),
          pin: pin.trim() || undefined,
          nickname: nickname.trim() || undefined,
        });
      }
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.detail ?? "Failed to save card.");
    } finally {
      setSaving(false);
    }
  }

  if (step === "merchant") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">Add a Card</Text>
          <Text className="text-gray-500">Step 1 of 2 — Select merchant</Text>
        </View>
        <MerchantPicker
          onSelect={(m) => {
            setSelectedMerchant(m);
            setStep("details");
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-4 pt-4 pb-2">
          <TouchableOpacity className="flex-row items-center mb-3" onPress={() => setStep("merchant")}>
            <Ionicons name="chevron-back" size={20} color="#2563EB" />
            <Text className="text-primary ml-1">Change merchant</Text>
          </TouchableOpacity>

          <View className="flex-row items-center mb-6">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: selectedMerchant!.brand_color ?? "#E5E7EB" }}
            >
              <Text className="text-white font-bold text-sm">
                {selectedMerchant!.name[0]}
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">{selectedMerchant!.name}</Text>
          </View>

          {/* Scan option */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl py-3 mb-6"
            onPress={() => setShowScanModal(true)}
            disabled={scanning}
          >
            {scanning ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <>
                <Ionicons name="camera-outline" size={20} color="#2563EB" />
                <Text className="ml-2 text-primary font-medium">Scan card image</Text>
              </>
            )}
          </TouchableOpacity>

          <View className="border-b border-gray-200 mb-6">
            <Text className="text-center text-gray-400 text-xs -mb-2 bg-gray-50 self-center px-2">or enter manually</Text>
          </View>

          <Text className="text-sm font-medium text-gray-700 mb-1">Card Number *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base bg-white"
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="Card number"
            keyboardType="numeric"
          />

          <Text className="text-sm font-medium text-gray-700 mb-1">PIN / Access Code</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base bg-white"
            value={pin}
            onChangeText={setPin}
            placeholder="Optional"
            keyboardType="numeric"
          />

          <Text className="text-sm font-medium text-gray-700 mb-1">Nickname</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-base bg-white"
            value={nickname}
            onChangeText={setNickname}
            placeholder="e.g. Birthday gift"
          />

          {/* Storage toggle */}
          {user && (
            <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-4 mb-6">
              <View className="flex-1 mr-4">
                <Text className="font-medium text-gray-900">Save locally only</Text>
                <Text className="text-sm text-gray-500">Keep this card on-device</Text>
              </View>
              <Switch
                value={saveLocally}
                onValueChange={setSaveLocally}
                trackColor={{ true: "#2563EB" }}
              />
            </View>
          )}

          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${!cardNumber.trim() ? "bg-gray-300" : "bg-primary"}`}
            onPress={handleSave}
            disabled={!cardNumber.trim() || saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Save Card</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ScanModal
        visible={showScanModal}
        onClose={() => setShowScanModal(false)}
        onScan={handleScan}
      />
    </SafeAreaView>
  );
}
