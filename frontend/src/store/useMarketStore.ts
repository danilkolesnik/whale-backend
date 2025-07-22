import { create } from "zustand";

interface Item {
    id: number;
    name: string;
    level: number;
    type: string;
}

export interface MarketBuyItem {
    id: number;
    itemType?: string;
    level?: number;
    price?: number;
    item?: Item;
    buyerId?: string;
    
}

export interface MarketSellItem {
    id: number;
    sellerId?: string;
    itemType?: string;
    level?: number;
    price?: number;
    currency?: string;
    item: Item;
}

type MarketBuyStore = {
    marketBuyItems: MarketBuyItem[];
    marketSellItems: MarketSellItem[];
    setMarketBuyItems: (marketItems: MarketBuyItem[]) => void;
    setMarketSellItems: (marketItems: MarketSellItem[]) => void;
}

export const useMarketBuyStore = create<MarketBuyStore>((set) => ({
    marketBuyItems: [],
    marketSellItems: [],
    setMarketBuyItems: (marketBuyItems) => set({ marketBuyItems }),
    setMarketSellItems: (marketSellItems) => set({ marketSellItems }),
}));

export type { MarketBuyStore };
