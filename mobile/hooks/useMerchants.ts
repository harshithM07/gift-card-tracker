import { useQuery } from "@tanstack/react-query";
import { merchantsApi } from "@/services/api";
import type { Merchant } from "@/hooks/useCards";

export function useMerchants() {
  return useQuery({
    queryKey: ["merchants"],
    queryFn: async () => {
      const { data } = await merchantsApi.list();
      return data as Merchant[];
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}
