import { create } from 'zustand';
interface DailyTask {
    id: number;
    title: string;
    coin: number;
    status: string;
    type: string;
    chatId?: number;
    channelLink?: string;
    requiredFriends?: number;
}

interface DailyStore {
    tasks: DailyTask[];
    setTasks: (tasks: DailyTask[]) => void;
}

export const useDailyStore = create<DailyStore>((set) => ({
    tasks: [],
    setTasks: (tasks) => set({ tasks }),
}));