import { useEffect, useState, useCallback } from "react";
import {
  getLocalCards,
  saveLocalCard,
  deleteLocalCard,
  updateLocalCardBalance,
  type LocalCard,
} from "@/services/localDb";
import { useAppStore } from "@/stores/appStore";

export function useLocalCards() {
  const [cards, setCards] = useState<LocalCard[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setCards(await getLocalCards());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { cards, loading, refresh };
}

export function useStoragePreference() {
  const { storagePreference, setStoragePreference } = useAppStore();
  return { storagePreference, setStoragePreference };
}
