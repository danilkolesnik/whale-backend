import api from "@/api/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { type User, type AuthData, useAuthStore } from "@/store/useUserStore";

export const useAuthenticate = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation<AuthData, Error, string>({
    mutationFn: async (initDataOrObject: string) => {
      try {
        const webAppData = JSON.parse(initDataOrObject);
        const requestData = { webAppData };

        const response = await api.post<AuthData>('/auth/authenticate', requestData);
        return response.data;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        
        throw new Error(`Ошибка аутентификации: ${axiosError.response?.data?.message || errorMessage}`);
      }
    },
    onSuccess: (data) => {
      console.log('Authentication successful, setting auth data...');
      setAuth({
        accessToken: data.access_token,
        user: data.user,
      });
    },
    onError: (error) => {
      console.error('Authentication failed:', error);
      setLoading(false);
    },
  });
};

const fetchUserData = async (token: string): Promise<User> => {
  try {
  const response = await api.get<User>('/auth/verify', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
    throw new Error(`Ошибка верификации: ${axiosError.response?.data?.message || errorMessage}`);
  }
};

export const useFetchUser = <T = User>(select?: (user: User) => T) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  const isDevMode = import.meta.env.VITE_NODE_ENV === 'development' || import.meta.env.DEV;
  
  const shouldEnable = isDevMode || (isAuthenticated && !!accessToken);

  const queryResult = useQuery<User, Error, T>({
    queryKey: ['user', accessToken],
    queryFn: () => {
      return fetchUserData(accessToken!);
    },
    select,
    enabled: shouldEnable,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (queryResult.data && queryResult.isSuccess && !select) {
      const userData = queryResult.data as unknown as User;
      setUser({
        id: userData.id,
        telegramId: userData.telegramId,
        displayName: userData.displayName,
        isNewUser: userData.isNewUser,
        balance: userData.balance,
        inventory: userData.inventory,
        equipment: userData.equipment,
        walletAddress: userData.walletAddress,
        usdtAddressBEP20: userData.usdtAddressBEP20,
        usdtAddressTRC20: userData.usdtAddressTRC20,
        friends: userData.friends,
        tasks: userData.tasks,
      });
    }
  }, [queryResult.data, queryResult.isSuccess, setUser, select]);

  return queryResult;
};

export const useFullAuth = () => {
  const authenticate = useAuthenticate();
  const setLoading = useAuthStore((state) => state.setLoading);
  const storeLoading = useAuthStore((state) => state.isLoading);
  
  const { refetch: fetchUser } = useFetchUser();

  const loginWithInitData = async (initData: string) => {
    try {
      setLoading(true);
      await authenticate.mutateAsync(initData);

      await fetchUser();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
      console.error('Full auth failed:', errorMessage);
      throw new Error(`Полная аутентификация не удалась: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    loginWithInitData,
    isLoading: authenticate.isPending || storeLoading,
    error: authenticate.error,
  };
};

export const useGetUpgradeSettings = () => {
  return useQuery({
    queryKey: ['upgrade-settings'],
    queryFn: () => api.get('/user/upgrade-settings'),
  });
};

export const useUsdtConversion = () =>{
  const telegramId = useAuthStore((state) => state.user?.telegramId);
  return useMutation({
    mutationFn: (data: {usdtQuantity: number}) => api.post('/shop/conversion/coin',{
      telegramId: telegramId,
      usdtQuantity: data.usdtQuantity,
    }),
  });
}

export const useCoinsConversion = () =>{
  const telegramId = useAuthStore((state) => state.user?.telegramId);
  return useMutation({
    mutationFn: (data: {coinsQuantity: number}) => api.post('/shop/conversion/usdt',{
      telegramId: telegramId,
      moneyQuantity: data.coinsQuantity,
    }),
  });
}

export const useBuyTools = () => {
  const telegramId = useAuthStore((state) => state.user?.telegramId);
  return useMutation({
    mutationFn: (data: {toolQuantity: number}) => api.post('/shop/tools',{
      telegramId: telegramId,
      toolQuantity: data.toolQuantity,
    }),
  });
}