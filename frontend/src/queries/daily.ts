// @ts-nocheck
import api from '@/api/axios';
import { useAuthStore } from '@/store/useUserStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDailyStore } from '@/store/useDailyStore';
import { useEffect } from 'react';

interface DailyTask {
    id: number;
    title: string;
    coin: number;
    status: string;
    chatId?: number;
    channelLink?: string;
    requiredFriends?: number;
}

export const useTakeDailyTask = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);

    return useMutation({
        mutationFn: (taskId: number) => api.post(`/daily-tasks/take/${taskId}`, {
            telegramId,
        }),
    });
}

export const useCompleteDailyTask = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);
    return useMutation({
        mutationFn: (taskId: number) => api.post(`/daily-tasks/complete/${taskId}`, {
            telegramId,
        }),
    });
}

export const useFetchDailyTasks = () => {
    const { setTasks } = useDailyStore();
    const queryResult = useQuery<DailyTask[]>({
        queryKey: ['daily-tasks'],
        queryFn: () => api.get('/daily-tasks/all').then((res) => res.data.data),
    });

    useEffect(() => {
        if (queryResult.data) {
            setTasks(queryResult.data);
        }
    }, [queryResult.data, setTasks]);

    return queryResult;
}
