import { useQuery, type UseQueryResult,useMutation } from '@tanstack/react-query';
import api from '@/api/axios';
import type { Rating } from '@/store/useRatingStore';
import { useRatingStore } from '@/store/useRatingStore';
import { useAuthStore } from '@/store/useUserStore';
import { useEffect } from 'react';


export const fetchRating = async (): Promise<Rating[]> => {
    const response = await api.get<Rating[]>('/rating/list');
    
    return response.data;
}

export const useAddRating = () => {
    const telegramId = useAuthStore((state) => state.user?.telegramId);

    return useMutation({
        mutationFn: () =>
            api.post(`/rating/add`, { telegramId }),
    });
}

export const useFetchRating = (): UseQueryResult<Rating[], Error> => {
    const setRatings = useRatingStore((state) => state.setRatings);
    const queryResult = useQuery({
        queryKey: ['rating'],
        queryFn: fetchRating,
    });

    useEffect(() => {
        if (queryResult.data) {
            setRatings(queryResult.data);
        }
    }, [queryResult.data, queryResult.isSuccess, setRatings]);

    return queryResult;
}

