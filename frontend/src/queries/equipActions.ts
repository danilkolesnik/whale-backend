import { useMutation } from '@tanstack/react-query';
import api from '@/api/axios';
import { useAuthStore } from '@/store/useUserStore';

export const useUnequipItem = () => {
  const telegramId = useAuthStore((state) => state.user?.telegramId);


  return useMutation({
    mutationFn: (itemId: number | string) =>
      api.post(`/user/items/${itemId}/unequip`, { telegramId }),
  });
};

export const useEquipItem = () => {
  const telegramId = useAuthStore((state) => state.user?.telegramId);

  return useMutation({
    mutationFn: (itemId: number | string) =>
      api.post(`/user/items/${itemId}/equip`, { telegramId }),
  });
};


export const useBuyItem = () => {
  const telegramId = useAuthStore((state) => state.user?.telegramId);

  return useMutation({
    mutationFn: (itemId: number | string) =>
      api.post(`/shop/buy/${itemId}`, { telegramId }),
  });
};

export const useUpgradeItem = () => {
  const telegramId = useAuthStore((state) => state.user?.telegramId);

  return useMutation({
    mutationFn: (itemId: number | string) =>
      api.post(`/user/items/${itemId}/upgrade`, { telegramId }),
  });
};