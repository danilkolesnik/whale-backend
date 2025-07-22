import { create } from "zustand";

export interface User {
    shield: number;
    addedAt: string;
    telegramId: string;
    displayName: string;
}

export interface Rating {
    id: number;
    createdAt: string;
    updatedAt: string;
    users: User[];
    totalShield: string;
    displayName: string;
    shield: number;
    roundCreatedAt: string;
}

type RatingStore = {
    ratings: Rating[];
    setRatings: (ratings: Rating[]) => void;
};

export const useRatingStore = create<RatingStore>((set) => ({
    ratings: [],
    setRatings: (ratings) => set({ ratings }),
}));

