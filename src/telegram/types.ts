import { Context } from 'grammy';

export interface SessionData {
  taskType?: string;
  reward?: number;
  chatId?: string;
  channelLink?: string;
  requiredFriends?: number;
  waitingForTelegramId?: boolean;
  creationStep?: string;
  itemType?: string;
  itemName?: string;
  itemShield?: number;
  itemLevel?: number;
  itemPrice?: number;
}

export type BotContext = Context & {
  session: SessionData;
}; 