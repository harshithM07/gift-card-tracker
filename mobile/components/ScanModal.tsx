import { View, Text, TouchableOpacity, Modal, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
  onScan: (imageUri: string) => void;
}

export default function ScanModal({ visible, onClose, onScan }: Props) {
  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      onScan(result.assets[0].uri);
    } else {
      onClose();
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      onClose();
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      onScan(result.assets[0].uri);
    } else {
      onClose();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
          <Text className="text-lg font-bold text-gray-900 mb-2">Scan Gift Card</Text>
          <Text className="text-gray-500 text-sm mb-6">
            Take a photo or choose an image — AI will extract the card details.
          </Text>

          {Platform.OS !== "web" && (
            <TouchableOpacity
              className="flex-row items-center bg-primary rounded-2xl px-5 py-4 mb-3"
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={22} color="white" />
              <Text className="ml-3 text-white font-semibold text-base">Take Photo</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-row items-center bg-gray-100 rounded-2xl px-5 py-4 mb-3"
            onPress={pickFromGallery}
          >
            <Ionicons name="image-outline" size={22} color="#374151" />
            <Text className="ml-3 text-gray-700 font-semibold text-base">Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center py-3"
            onPress={onClose}
          >
            <Text className="text-gray-500">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
