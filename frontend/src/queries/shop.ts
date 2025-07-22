import api from "@/api/axios";
import type { ShopItem } from "@/store/useShopStore";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

type ShopResponse = {
  data: ShopItem[];
  message: string;
};

const fetchShop = async (): Promise<ShopItem[]> => {
  const token = import.meta.env.VITE_TOKEN;

  const response = await api.get<ShopResponse>("/shop/items", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
};

export const useFetchShop = (): UseQueryResult<ShopItem[], Error> => {
  return useQuery({
    queryKey: ["shop"],
    queryFn: fetchShop,
    staleTime: 1000 * 60,
    retry: 1,  
    refetchOnWindowFocus: false,
  });
};