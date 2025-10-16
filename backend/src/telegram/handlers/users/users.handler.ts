import { Context } from 'grammy';
import axios from 'axios';
import { API_URL } from '../../../utils/constant';
import { BotContext } from '../types';

export async function handleUsersMenu(ctx: BotContext) {
  if (ctx.callbackQuery) {
    await ctx.editMessageText('Меню користувачів:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Кількість користувачів', callback_data: 'get_all_users' }],
          [{ text: '🔍 Переглянути користувача', callback_data: 'view_user_menu' }],
          [{ text: '💰 Оновити параметри', callback_data: 'update_user_menu' }],
          [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
        ]
      }
    });
  } else {
    await ctx.reply('Меню користувачів:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Кількість користувачів', callback_data: 'get_all_users' }],
          [{ text: '🔍 Переглянути користувача', callback_data: 'view_user_menu' }],
          [{ text: '💰 Оновити параметри', callback_data: 'update_user_menu' }],
          [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
        ]
      }
    });
  }
}

export async function handleViewUserMenu(ctx: BotContext) {
  ctx.session.waitingForTelegramId = true;
  if (ctx.callbackQuery) {
    await ctx.editMessageText('Введіть Telegram ID користувача:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
  } else {
    await ctx.reply('Введіть Telegram ID користувача:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
  }
}

export async function handleUpdateUserMenu(ctx: BotContext) {
  if (ctx.callbackQuery) {
    await ctx.editMessageText('Виберіть дію:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '💰 Оновити гроші', callback_data: 'update_user_money' }],
          [{ text: '🛡️ Оновити щит', callback_data: 'update_user_shield' }],
          [{ text: '💎 Оновити USDT', callback_data: 'update_user_usdt' }],
          [{ text: '🔧 Оновити інструменти', callback_data: 'update_user_tools' }],
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
  } else {
    await ctx.reply('Виберіть дію:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '💰 Оновити гроші', callback_data: 'update_user_money' }],
          [{ text: '🛡️ Оновити щит', callback_data: 'update_user_shield' }],
          [{ text: '💎 Оновити USDT', callback_data: 'update_user_usdt' }],
          [{ text: '🔧 Оновити інструменти', callback_data: 'update_user_tools' }],
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
  }
}

export async function handleGetAllUsers(ctx: BotContext) {
  try {
    const users = await fetchUsers();
    const usersCount = users.length;
    
    if (ctx.callbackQuery) {
      await ctx.editMessageText(`📊 Статистика користувачів:\n\n👥 Загальна кількість користувачів: ${usersCount}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    } else {
      await ctx.reply(`📊 Статистика користувачів:\n\n👥 Загальна кількість користувачів: ${usersCount}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    }
  } catch (error) {
    if (ctx.callbackQuery) {
      await ctx.editMessageText(error instanceof Error ? error.message : 'An unexpected error occurred.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    } else {
      await ctx.reply(error instanceof Error ? error.message : 'An unexpected error occurred.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    }
  }
}

export async function handleUpdateUserMoney(ctx: BotContext) {
  ctx.session.waitingForMoney = true;
  await ctx.editMessageText('Введіть Telegram ID користувача, якому потрібно оновити гроші:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔙 Назад', callback_data: 'users_menu' }]
      ]
    }
  });
}

export async function handleUpdateUserShield(ctx: BotContext) {
  ctx.session.waitingForShield = true;
  await ctx.editMessageText('Введіть Telegram ID користувача, якому потрібно оновити щит:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔙 Назад', callback_data: 'users_menu' }]
      ]
    }
  });
}

export async function handleUpdateUserUsdt(ctx: BotContext) {
  ctx.session.waitingForUsdt = true;
  await ctx.editMessageText('Введіть Telegram ID користувача, якому потрібно оновити USDT:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔙 Назад', callback_data: 'users_menu' }]
      ]
    }
  });
}

export async function handleUpdateUserTools(ctx: BotContext) {
  ctx.session.waitingForTools = true;
  await ctx.editMessageText('Введіть Telegram ID користувача, якому потрібно оновити інструменти:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔙 Назад', callback_data: 'users_menu' }]
      ]
    }
  });
}

export async function handleUpdateItemMenu(ctx: BotContext) {
  if (ctx.callbackQuery) {
    await ctx.editMessageText('Виберіть дію з предметом:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📈 Оновити рівень предмета', callback_data: 'update_item_level' }],
          [{ text: '🛡️ Оновити щит предмета', callback_data: 'update_item_shield' }],
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
  } else {
    await ctx.reply('Виберіть дію з предметом:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📈 Оновити рівень предмета', callback_data: 'update_item_level' }],
          [{ text: '🛡️ Оновити щит предмета', callback_data: 'update_item_shield' }],
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
  }
}

export async function handleUpdateItemLevel(ctx: BotContext) {
  ctx.session.waitingForItemTelegramId = true;
  ctx.session.itemUpdateType = 'level';
  await ctx.editMessageText('Введіть Telegram ID користувача:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔙 Назад', callback_data: 'update_item_menu' }]
      ]
    }
  });
}

export async function handleUpdateItemShield(ctx: BotContext) {
  ctx.session.waitingForItemTelegramId = true;
  ctx.session.itemUpdateType = 'shield';
  await ctx.editMessageText('Введіть Telegram ID користувача:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔙 Назад', callback_data: 'update_item_menu' }]
      ]
    }
  });
}

export async function handleUserInput(ctx: BotContext) {
  const telegramId = ctx.message?.text;
  if (!telegramId) {
    await ctx.reply('Будь ласка, введіть коректний Telegram ID.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
    return;
  }
  try {
    const response = await axios.get(`${API_URL}/user/user-by-telegram-id?telegramId=${telegramId}`);
    const user = response.data.data;
    await ctx.reply(`
Ім'я: ${user.displayName || 'Невідомо'}
💰 Гроші: ${user.balance.money || 0}
🛡️ Загальний щит: ${user.balance.shield || 0}
💎 USDT: ${user.balance.usdt || 0}
🔧 Інструменти: ${user.balance.tools || 0}
Инвентарь:
${user.inventory.map((item, index) => `
${index + 1}. Назва: ${item.name}
    Тип: ${item.type}
    Рівень: ${item.level}
    Щит: ${item.shield}
    Ціна: ${item.price}`).join('\n')}
`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
  } catch (error) {
    await ctx.reply('Помилка при отриманні даних користувача.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
  }
  delete ctx.session.waitingForTelegramId;
}

export async function handleUserTextInput(ctx: BotContext) {
  // Обновление денег
  if (ctx.session.waitingForMoney) {
    const telegramId = ctx.message?.text;
    if (!telegramId) {
      await ctx.reply('Будь ласка, введіть коректний Telegram ID.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
      return;
    }
    ctx.session.updateMoneyTelegramId = telegramId;
    ctx.session.waitingForMoney = false;
    ctx.session.waitingForMoneyValue = true;
    await ctx.reply('Введіть нову суму грошей:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
    return;
  }
  if (ctx.session.waitingForMoneyValue) {
    const money = Number(ctx.message?.text);
    if (isNaN(money)) {
      await ctx.reply('Будь ласка, введіть коректну суму.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
      return;
    }
    const telegramId = ctx.session.updateMoneyTelegramId;
    try {
      await axios.post(`${API_URL}/user/update-parameters`, {
        telegramId,
        money
      });
      await ctx.reply('Гроші оновлено!', {
       reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    } catch (e) {
      await ctx.reply('Помилка при оновленні грошей.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    }
    ctx.session.waitingForMoneyValue = false;
    ctx.session.updateMoneyTelegramId = undefined;
    return;
  }
  // Обновление щита
  if (ctx.session.waitingForShield) {
    const telegramId = ctx.message?.text;
    if (!telegramId) {
      await ctx.reply('Будь ласка, введіть коректний Telegram ID.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
      return;
    }
    ctx.session.updateShieldTelegramId = telegramId;
    ctx.session.waitingForShield = false;
    ctx.session.waitingForShieldValue = true;
    await ctx.reply('Введіть новий щит:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
    return;
  }
  if (ctx.session.waitingForShieldValue) {
    const shield = Number(ctx.message?.text);
    if (isNaN(shield)) {
      await ctx.reply('Будь ласка, введіть коректне число.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
      return;
    }
    const telegramId = ctx.session.updateShieldTelegramId;
    try {
      await axios.post(`${API_URL}/user/update-parameters`, {
        telegramId,
        shield
      });
      await ctx.reply('Щит оновлено!', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    } catch (e) {
      await ctx.reply('Помилка при оновленні щита.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    }
    ctx.session.waitingForShieldValue = false;
    ctx.session.updateShieldTelegramId = undefined;
    return;
  }
  // Обновление USDT
  if (ctx.session.waitingForUsdt) {
    const telegramId = ctx.message?.text;
    if (!telegramId) {
      await ctx.reply('Будь ласка, введіть коректний Telegram ID.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
      return;
    }
    ctx.session.updateUsdtTelegramId = telegramId;
    ctx.session.waitingForUsdt = false;
    ctx.session.waitingForUsdtValue = true;
    await ctx.reply('Введіть нову суму USDT:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
    return;
  }
  if (ctx.session.waitingForUsdtValue) {
    const usdt = Number(ctx.message?.text);
    if (isNaN(usdt)) {
      await ctx.reply('Будь ласка, введіть коректну суму.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
      return;
    }
    const telegramId = ctx.session.updateUsdtTelegramId;
    try {
      await axios.post(`${API_URL}/user/update-parameters`, {
        telegramId,
        usdt
      });
      await ctx.reply('USDT оновлено!', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    } catch (e) {
      await ctx.reply('Помилка при оновленні USDT.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    }
    ctx.session.waitingForUsdtValue = false;
    ctx.session.updateUsdtTelegramId = undefined;
    return;
  }
  // Обновление инструментов
  if (ctx.session.waitingForTools) {
    const telegramId = ctx.message?.text;
    if (!telegramId) {
      await ctx.reply('Будь ласка, введіть коректний Telegram ID.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
      return;
    }
    ctx.session.updateToolsTelegramId = telegramId;
    ctx.session.waitingForTools = false;
    ctx.session.waitingForToolsValue = true;
    await ctx.reply('Введіть нову кількість інструментів:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
    return;
  }
  if (ctx.session.waitingForToolsValue) {
    const tools = Number(ctx.message?.text);
    if (isNaN(tools)) {
      await ctx.reply('Будь ласка, введіть коректне число.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
      return;
    }
    const telegramId = ctx.session.updateToolsTelegramId;
    try {
      await axios.post(`${API_URL}/user/update-parameters`, {
        telegramId,
        tools
      });
      await ctx.reply('Інструменти оновлено!', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    } catch (e) {
      await ctx.reply('Помилка при оновленні інструментів.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    }
    ctx.session.waitingForToolsValue = false;
    ctx.session.updateToolsTelegramId = undefined;
    return;
  }
  // Обновление предметов
  if (ctx.session.waitingForItemTelegramId) {
    const telegramId = ctx.message?.text;
    if (!telegramId) {
      await ctx.reply('Будь ласка, введіть коректний Telegram ID.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'update_item_menu' }]
          ]
        }
      });
      return;
    }
    
    try {
      const response = await axios.get(`${API_URL}/user/user-by-telegram-id?telegramId=${telegramId}`);
      const user = response.data.data;
      
      if (!user.inventory || user.inventory.length === 0) {
        await ctx.reply('У користувача немає предметів в інвентарі.', {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Назад', callback_data: 'update_item_menu' }]
            ]
          }
        });
        return;
      }

      ctx.session.updateItemTelegramId = telegramId;
      ctx.session.waitingForItemTelegramId = false;
      ctx.session.waitingForItemId = true;

      const inventoryList = user.inventory.map((item: any, index: number) => 
        `${index + 1}. ${item.name} (ID: ${item.id}) - Рівень: ${item.level}, Щит: ${item.shield}`
      ).join('\n');

      await ctx.reply(`Виберіть предмет для оновлення ${ctx.session.itemUpdateType === 'level' ? 'рівня' : 'щита'}:\n\n${inventoryList}\n\nВведіть ID предмета:`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'update_item_menu' }]
          ]
        }
      });
    } catch (error) {
      await ctx.reply('Помилка при отриманні даних користувача.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'update_item_menu' }]
          ]
        }
      });
    }
    return;
  }
  
  if (ctx.session.waitingForItemId) {
    const itemId = Number(ctx.message?.text);
    if (isNaN(itemId)) {
      await ctx.reply('Будь ласка, введіть коректний ID предмета.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'update_item_menu' }]
          ]
        }
      });
      return;
    }
    
    ctx.session.updateItemId = itemId;
    ctx.session.waitingForItemId = false;
    ctx.session.waitingForItemValue = true;
    
    const updateType = ctx.session.itemUpdateType === 'level' ? 'рівень' : 'щит';
    await ctx.reply(`Введіть новий ${updateType} предмета:`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'update_item_menu' }]
        ]
      }
    });
    return;
  }
  
  if (ctx.session.waitingForItemValue) {
    const value = Number(ctx.message?.text);
    if (isNaN(value)) {
      await ctx.reply('Будь ласка, введіть коректне число.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'update_item_menu' }]
          ]
        }
      });
      return;
    }
    
    const telegramId = ctx.session.updateItemTelegramId;
    const itemId = ctx.session.updateItemId;
    const parameter = ctx.session.itemUpdateType;
    
    try {
      await axios.post(`${API_URL}/user/items/${itemId}/update-parameter`, {
        telegramId,
        parameter,
        value
      });
      
      const updateType = parameter === 'level' ? 'рівень' : 'щит';
      await ctx.reply(`${updateType.charAt(0).toUpperCase() + updateType.slice(1)} предмета оновлено!`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'update_item_menu' }]
          ]
        }
      });
    } catch (e) {
      const updateType = parameter === 'level' ? 'рівня' : 'щита';
      await ctx.reply(`Помилка при оновленні ${updateType} предмета.`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'update_item_menu' }]
          ]
        }
      });
    }
    
    // Очистка сессии
    ctx.session.waitingForItemValue = false;
    ctx.session.updateItemTelegramId = undefined;
    ctx.session.updateItemId = undefined;
    ctx.session.itemUpdateType = undefined;
    return;
  }
}

async function fetchUsers() {
  try {
    const response = await axios.get(`${API_URL}/user/all-users`);
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw new Error('Помилка при отриманні даних користувачів.');
  }
} 