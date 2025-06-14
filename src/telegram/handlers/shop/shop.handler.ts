import { BotContext } from '../types';
import axios from 'axios';
import { API_URL, SHOP_TYPES } from '../../../utils/constant';

export async function handleShopMenu(ctx: BotContext) {
  if (ctx.callbackQuery) {
    await ctx.editMessageText('Меню магазину:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Список предметів', callback_data: 'get_shop_items' }],
          [{ text: '➕ Створити предмет', callback_data: 'create_shop_item' }],
          [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
        ]
      }
    });
  } else {
    await ctx.reply('Меню магазину:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Список предметів', callback_data: 'get_shop_items' }],
          [{ text: '➕ Створити предмет', callback_data: 'create_shop_item' }],
          [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
        ]
      }
    });
  }
}

export async function handleGetShopItems(ctx: BotContext) {
  try {
    const items = await fetchItems();
    const itemsList = items.map(item => 
      `ID: ${item.id}\nНазва: ${item.name}\nРівень: ${item.level}\nЩит: ${item.shield}\nТип: ${item.type}\nЦіна: ${item.price}`
    ).join('\n\n');

    if (ctx.callbackQuery) {
      await ctx.editMessageText(`Список предметів магазину:\n\n${itemsList}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
          ]
        }
      });
    } else {
      await ctx.reply(`Список предметів магазину:\n\n${itemsList}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
          ]
        }
      });
    }
  } catch (error) {
    if (ctx.callbackQuery) {
      await ctx.editMessageText(error instanceof Error ? error.message : 'An unexpected error occurred.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
          ]
        }
      });
    } else {
      await ctx.reply(error instanceof Error ? error.message : 'An unexpected error occurred.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
          ]
        }
      });
    }
  }
}

export async function handleCreateShopItem(ctx: BotContext) {
  if (ctx.callbackQuery) {
    await ctx.editMessageText('Виберіть тип предмета:', {
      reply_markup: {
        inline_keyboard: [
          ...SHOP_TYPES.map(type => [{ text: type, callback_data: `type_${type}` }]),
          [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
        ]
      }
    });
  } else {
    await ctx.reply('Виберіть тип предмета:', {
      reply_markup: {
        inline_keyboard: [
          ...SHOP_TYPES.map(type => [{ text: type, callback_data: `type_${type}` }]),
          [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
        ]
      }
    });
  }
}

export async function handleShopItemInput(ctx: BotContext) {
  const messageText = ctx.message?.text;
  if (!messageText) {
    await ctx.reply('Будь ласка, введіть коректне значення.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
        ]
      }
    });
    return;
  }

  if (!ctx.session.itemType) {
    await ctx.reply('Помилка: тип предмета не вибрано. Спробуйте ще раз.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
        ]
      }
    });
    return;
  }

  if (!ctx.session.itemName) {
    ctx.session.itemName = messageText;
    await ctx.reply('Введіть рівень щита:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
        ]
      }
    });
    return;
  }

  if (ctx.session.itemShield === undefined) {
    const shield = parseInt(messageText, 10);
    if (isNaN(shield)) {
      await ctx.reply('Будь ласка, введіть коректний рівень щита.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
          ]
        }
      });
      return;
    }
    ctx.session.itemShield = shield;
    await ctx.reply('Введіть рівень предмета:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
        ]
      }
    });
    return;
  }

  if (ctx.session.itemLevel === undefined) {
    const level = parseInt(messageText, 10);
    if (isNaN(level)) {
      await ctx.reply('Будь ласка, введіть коректний рівень предмета.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
          ]
        }
      });
      return;
    }
    ctx.session.itemLevel = level;
    await ctx.reply('Введіть ціну предмета:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
        ]
      }
    });
    return;
  }

  if (ctx.session.itemPrice === undefined) {
    const price = parseInt(messageText, 10);
    if (isNaN(price)) {
      await ctx.reply('Будь ласка, введіть коректну ціну.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
          ]
        }
      });
      return;
    }
    ctx.session.itemPrice = price;
    await createShopItem(ctx);
  }
}

async function createShopItem(ctx: BotContext) {
  const { itemType, itemName, itemShield, itemLevel, itemPrice } = ctx.session;
  try {
    console.log('Creating shop item with data:', { itemType, itemName, itemShield, itemLevel, itemPrice });
    const response = await axios.post(`${API_URL}/shop/create-item`, {
      type: itemType,
      name: itemName,
      shield: itemShield,
      level: itemLevel,
      price: itemPrice
    });
    
    if (response.data.success) {
      await ctx.reply('Предмет створено успішно.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад до меню магазину', callback_data: 'shop_menu' }]
          ]
        }
      });
    } else {
      await ctx.reply(`Помилка при створенні предмета: ${response.data.error}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад до меню магазину', callback_data: 'shop_menu' }]
          ]
        }
      });
    }
  } catch (error) {
    console.error('Error creating shop item:', error);
    await ctx.reply('Помилка при створенні предмета.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад до меню магазину', callback_data: 'shop_menu' }]
        ]
      }
    });
  }
  // Clear session data
  delete ctx.session.itemType;
  delete ctx.session.itemName;
  delete ctx.session.itemShield;
  delete ctx.session.itemLevel;
  delete ctx.session.itemPrice;
}

async function fetchItems() {
  try {
    const response = await axios.get(`${API_URL}/shop/items`);
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw new Error('Помилка при отриманні даних предметів.');
  }
} 