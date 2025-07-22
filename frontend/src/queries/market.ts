//@ts-nocheck
import { useAuthStore } from '@/store/useUserStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useMarketBuyStore } from '@/store/useMarketStore';
import type { MarketBuyStore } from '@/store/useMarketStore';
import type { MarketBuyItem } from '@/store/useMarketStore';
import api from '@/api/axios';

interface BuyItem{
    id?: number;
    currency?: string;
}

interface SellItem{
    itemId?: number;
    price?: number;
    level?: number;
}

export const useFetchMarketBuyItems = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);
    return useMutation({
        mutationFn: () =>
            api.get(`/market/buy-orders`, {
                data: { telegramId }
            }),
    });
}

export const useFetchMarketSellItems = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);
    return useMutation({
        mutationFn: () =>
            api.get(`/market/listings`,{
                data: { telegramId }
            }),
    });
}

export const useCreateMarketBuyOrder = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);
    return useMutation({
        mutationFn: (data: MarketBuyItem) =>
            api.post(`/market/buy-orders`, {
                telegramId: telegramId,
                itemType: data.itemType,
                price: data.price,
                level: data.level,
            }),
    });
}

export const useCreateMarketSellOrder = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);
    return useMutation({
        mutationFn: (data: SellItem) =>
            api.post(`/market/listings`, {
                telegramId: telegramId,
                itemId: data.itemId,
                price: data.price,
            }),
        onSuccess: (data) => {
            console.log(data);    
        },
        onError: () => {
           
        },
    });
}

export const useBuyItem = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);
    return useMutation({
        mutationFn: (data: BuyItem) =>
            api.post(`/market/buy-orders/${data.id}/fulfill`, { telegramId, currency: data.currency }),
    });
}
export const useSellItem = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);
    return useMutation({
        mutationFn: (data: BuyItem) =>
            api.post(`/market/listings/${data.id}/buy`, { telegramId, currency: data.currency }),
    });
}

export const useUpdateMarketSellItem = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);
    return useMutation({
        mutationFn: (data: SellItem) =>
            api.post(`/market/listings/${data.itemId}/update`, {
                telegramId,
                price: data.price,
                level: data.level,
            }),
    });
}

export const useUpdateMarketBuyItem = () => {
    return useMutation({
        mutationFn: (data: MarketBuyItem) =>
            api.post(`/market/buy-orders/${data.id}/update`, { 
                newPrice: data.price,
                newLevel: data.level,
            }),
    });
}

export const useFetchMarketBuyItemsQuery = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);
    const setMarketBuyItems = useMarketBuyStore((state: MarketBuyStore) => state.setMarketBuyItems);
    const queryResult = useQuery({
        queryKey: ['marketBuyItems'],
        queryFn: () => api.get(`/market/buy-orders`, { data: { telegramId } }).then(response => response.data)
    });

    useEffect(() => {
        if (queryResult.data) {
            setMarketBuyItems(queryResult.data.data);
        }
    }, [queryResult.data, setMarketBuyItems]);

    return queryResult;
}

export const useFetchMarketSellItemsQuery = () => {
    const setMarketSellItems = useMarketBuyStore((state: MarketBuyStore) => state.setMarketSellItems);
    const queryResult = useQuery({
        queryKey: ['marketSellItems'],
        queryFn: () => api.get(`/market/listings`).then(response => response.data)
    });

    useEffect(() => {
        if (queryResult.data) {
            setMarketSellItems(queryResult.data.data);
        }
    }, [queryResult.data,setMarketSellItems]);

    return queryResult;
}

export const useDeleteMarketSellItem = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);
    return useMutation({
        mutationFn: (data: SellItem) =>
            api.post(`/market/listings/${data.itemId}/delete`, {
                telegramId: telegramId,
            }),
    });
}

export const useDeleteMarketBuyItem = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);
    return useMutation({
        mutationFn: (data: MarketBuyItem) =>
            api.post(`/market/buy-orders/${data.itemId}/delete`, {
                telegramId: telegramId,
            }),
    });
}