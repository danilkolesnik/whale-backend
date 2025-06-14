import { Context } from 'grammy';
import axios from 'axios';
import { API_URL } from '../../../utils/constant';
import { BotContext } from '../../types';

export async function handleUsersMenu(ctx: BotContext) {
  if (ctx.callbackQuery) {
    await ctx.editMessageText('Меню користувачів:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Список всіх користувачів', callback_data: 'get_all_users' }],
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
          [{ text: '📋 Список всіх користувачів', callback_data: 'get_all_users' }],
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
          [{ text: '🔙 Назад', callback_data: 'users_menu' }]
        ]
      }
    });
  }
}

export async function handleGetAllUsers(ctx: BotContext) {
  try {
    const users = await fetchUsers();
    const usersList = users.map(user => `ID: ${String(user.telegramId)}\nІм'я: ${String(user.displayName)}`).join('\n\n');
    
    if (ctx.callbackQuery) {
      await ctx.editMessageText(`Список користувачів:\n\n${usersList}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'users_menu' }]
          ]
        }
      });
    } else {
      await ctx.reply(`Список користувачів:\n\n${usersList}`, {
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
Баланс: ${user.balance.money || 0}
Загальний щит: ${user.balance.shield || 0}
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

async function fetchUsers() {
  try {
    const response = await axios.get(`${API_URL}/user/all-users`);
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw new Error('Помилка при отриманні даних користувачів.');
  }
} 