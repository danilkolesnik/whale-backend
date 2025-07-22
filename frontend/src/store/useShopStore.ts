import { create } from "zustand";
import type { ItemType } from "./useUserStore";

export interface ShopItem {
  id: number;
  name: string;
  level: number;
  shield: number;
  type: ItemType;
  price: number;
  createdAt: string;
  updatedAt: string;
}


type ShopStore = {
  items: ShopItem[];
  isLoading: boolean;
  error: string | null;
  setItems: (items: ShopItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useShopStore = create<ShopStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  setItems: (items) => set({ items }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));