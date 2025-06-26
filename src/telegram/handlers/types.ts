import { Context } from 'grammy';

export interface SessionData {
  taskType?: string;
  reward?: number;
  chatId?: string;
  channelLink?: string;
  requiredFriends?: number;
  title?: string;
  waitingForTelegramId?: boolean;
  creationStep?: string;
  itemType?: string;
  itemName?: string;
  itemShield?: number;
  itemLevel?: number;
  itemPrice?: number;
  // Upgrade settings fields
  upgradeAction?: string;
  upgradeStep?: string;
  upgradeData?: {
    levelRange?: string;
    toolsCost?: number;
    successRate?: number;
    useSequence?: boolean;
    sequence?: boolean[];
  };
}

export type BotContext = Context & {
  session: SessionData;
}; 