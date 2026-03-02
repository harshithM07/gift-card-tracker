import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cardsApi } from "@/services/api";

export function useCards() {
  return useQuery({
    queryKey: ["cards"],
    queryFn: async () => {
      const { data } = await cardsApi.list();
      return data as Card[];
    },
  });
}

export function useCard(id: string) {
  return useQuery({
    queryKey: ["cards", id],
    queryFn: async () => {
      const { data } = await cardsApi.get(id);
      return data as CardDetail;
    },
  });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cardsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });
}

export function useUpdateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof cardsApi.update>[1] }) =>
      cardsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cardsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });
}

export function useCheckBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cardsApi.checkBalance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  balance_check_url: string | null;
  has_api: boolean;
  brand_color: string | null;
  is_active: boolean;
}

export interface Card {
  id: string;
  merchant_id: string;
  merchant: Merchant;
  card_number_masked: string;
  nickname: string | null;
  notes: string | null;
  balance: number | null;
  balance_updated_at: string | null;
  image_url: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface CardDetail extends Card {
  card_number: string;
  pin: string | null;
}
