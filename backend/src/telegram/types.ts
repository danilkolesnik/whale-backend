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

  // === Добавлено для обновления USDT и инструментов ===
  waitingForUsdt?: boolean;
  waitingForUsdtValue?: boolean;
  updateUsdtTelegramId?: string;

  waitingForTools?: boolean;
  waitingForToolsValue?: boolean;
  updateToolsTelegramId?: string;

  // === Добавлено для обновления предметов ===
  waitingForItemTelegramId?: boolean;
  waitingForItemId?: boolean;
  waitingForItemValue?: boolean;
  updateItemTelegramId?: string;
  updateItemId?: number;
  itemUpdateType?: 'level' | 'shield';
  
  // === Добавлено для обновления предметов по типу ===
  waitingForItemsByTypeTelegramId?: boolean;
  waitingForItemsByTypeParameter?: boolean;
  waitingForItemsByTypeValue?: boolean;
  updateItemsByTypeTelegramId?: string;
  itemsByTypeUpdateType?: 'armor' | 'helmet' | 'leg';
  itemsByTypeParameter?: 'level' | 'shield';
}

export type BotContext = Context & {
  session: SessionData;
}; 