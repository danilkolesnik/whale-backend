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
  // === Добавлено для обновления денег и щита ===
  waitingForMoney?: boolean;
  waitingForMoneyValue?: boolean;
  updateMoneyTelegramId?: string;
  waitingForShield?: boolean;
  waitingForShieldValue?: boolean;
  updateShieldTelegramId?: string;
}

export type BotContext = Context & {
  session: SessionData;
}; 