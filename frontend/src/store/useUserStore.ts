import { create } from 'zustand';

export type ItemType = 'Helmet' | 'Armor' | 'Leg';
export interface Item {
  id: number;
  name: string;
  level: number;
  shield: number;
  type: ItemType;
}
export interface Balance {
  money: number;
  tools: number;
  shield: number;
  usdt: number;
}
export interface Task {
  id: number;
  taskId: number;
  title: string;
  type: 'subscription' | 'invite' | "external_sub" | string;
  coin: number;
  status: 'available' | 'completed' | string;
  completedAt: string | null;
  chatId: string;
  createdAt: string;
  updatedAt: string;
  userId: number | null;
  channelLink: string;
  requiredFriends: number | null;
  friendsCount?: number;
}
export interface User {
  id: number;
  telegramId: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  isNewUser: boolean;
  balance: Balance;
  inventory: Item[];
  equipment: Item[];
  createdAt: string;
  updatedAt: string;
  friends?: User[];
  walletAddress: string | null;
  usdtAddressBEP20: string;
  usdtAddressTRC20: string;
  tasks: Task[];
}

export type AuthUser = {
  id: number;
  telegramId: string;
  displayName: string;
  isNewUser: boolean;
  balance: Balance;
  inventory: Item[];
  equipment: Item[];
  walletAddress: string | null;
  usdtAddressBEP20: string;
  usdtAddressTRC20: string;
  friends?: User[];
  tasks: Task[];
};

export type AuthData = {
  access_token: string;
  user: AuthUser;
};

type AuthStore = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (data: { accessToken: string; user: AuthUser }) => void;
  setUser: (user: AuthUser | User) => void;
  updateDisplayName: (displayName: string) => void;
  updateUserStatus: (isNewUser : boolean) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateInventory: (inventory: Item[]) => void;
  updateEquipment: (equipment: Item[]) => void;
  updateBalance: (balance: Balance) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: ({ accessToken, user }) =>
    set(() => ({
      accessToken,
      user,
      isAuthenticated: true,
      isLoading: false,
    })),

  setUser: (user) =>
    set((state) => ({
      ...state,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        displayName: user.displayName,
        isNewUser: user.isNewUser,
        balance: user.balance,
        inventory: user.inventory,
        equipment: user.equipment,
        walletAddress: user.walletAddress,
        usdtAddressBEP20: user.usdtAddressBEP20,
        usdtAddressTRC20: user.usdtAddressTRC20,
        friends: user.friends,
        tasks: user.tasks,
      },
    })),

  updateInventory: (inventory: Item[]) =>
    set((state) => ({
      ...state,
      user: state.user ? { ...state.user, inventory } : null,
    })),

  updateEquipment: (equipment: Item[]) =>
    set((state) => ({
      ...state,
      user: state.user ? { ...state.user, equipment } : null,
    })),

  updateBalance: (balance: Balance) =>
    set((state) => ({
      ...state,
      user: state.user ? { ...state.user, balance } : null,
    })),


  updateDisplayName: (displayName) =>
    set((state) => ({
      ...state,
      user: state.user ? { ...state.user, displayName } : null,
  })),

  updateUserStatus: (isNewUser) =>
    set((state) => ({
      ...state,
      user: state.user ? { ...state.user, isNewUser } : null,
  })),
    

  clearAuth: () =>
    set(() => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })),

  setLoading: (loading: boolean) =>
    set(() => ({
      isLoading: loading,
    })),
}));

