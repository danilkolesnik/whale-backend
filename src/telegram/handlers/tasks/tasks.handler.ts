import { BotContext } from '../types';
import axios from 'axios';
import { API_URL } from '../../../utils/constant';

export async function handleTasksMenu(ctx: BotContext) {
  if (ctx.callbackQuery) {
    await ctx.editMessageText('Меню завдань:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Список завдань', callback_data: 'get_all_tasks' }],
          [{ text: '➕ Створити завдання', callback_data: 'create_task_menu' }],
          [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
        ]
      }
    });
  } else {
    await ctx.reply('Меню завдань:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Список завдань', callback_data: 'get_all_tasks' }],
          [{ text: '➕ Створити завдання', callback_data: 'create_task_menu' }],
          [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
        ]
      }
    });
  }
}

export async function handleCreateTaskMenu(ctx: BotContext) {
  if (ctx.callbackQuery) {
    await ctx.editMessageText('Виберіть тип завдання:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📢 Підписка', callback_data: 'create_task_subscription' }],
          [{ text: '👥 Запрошення', callback_data: 'create_task_invite' }],
          [{ text: '🔙 Назад', callback_data: 'tasks_menu' }]
        ]
      }
    });
  } else {
    await ctx.reply('Виберіть тип завдання:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📢 Підписка', callback_data: 'create_task_subscription' }],
          [{ text: '👥 Запрошення', callback_data: 'create_task_invite' }],
          [{ text: '🔙 Назад', callback_data: 'tasks_menu' }]
        ]
      }
    });
  }
}

export async function handleCreateTaskSubscription(ctx: BotContext) {
  ctx.session.taskType = 'subscription';
  if (ctx.callbackQuery) {
    await ctx.editMessageText('Введіть нагороду для завдання:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'create_task_menu' }]
        ]
      }
    });
  } else {
    await ctx.reply('Введіть нагороду для завдання:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'create_task_menu' }]
        ]
      }
    });
  }
}

export async function handleCreateTaskInvite(ctx: BotContext) {
  ctx.session.taskType = 'invite';
  if (ctx.callbackQuery) {
    await ctx.editMessageText('Введіть нагороду для завдання:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'create_task_menu' }]
        ]
      }
    });
  } else {
    await ctx.reply('Введіть нагороду для завдання:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'create_task_menu' }]
        ]
      }
    });
  }
}

export async function handleGetAllTasks(ctx: BotContext) {
  try {
    const tasks = await fetchTasks();
    if (ctx.callbackQuery) {
      await ctx.editMessageText('Список задач:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'tasks_menu' }]
          ]
        }
      });
    } else {
      await ctx.reply('Список задач:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'tasks_menu' }]
          ]
        }
      });
    }
    for (const task of tasks) {
      const date = new Date(String(task.createdAt));
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      const taskType = task.type === 'subscription' ? 'Підписка' : task.type === 'invite' ? 'Запрошення' : 'Невідомий тип';
      await ctx.reply(`\nID: ${String(task.id)}\nТип: ${taskType}\nНагорода: ${String(task.coin)}\nПосилання на канал: ${task.channelLink || 'Немає'}\nДата створення: ${formattedDate}`);
    }
  } catch (error) {
    if (ctx.callbackQuery) {
      await ctx.editMessageText(error instanceof Error ? error.message : 'An unexpected error occurred.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'tasks_menu' }]
          ]
        }
      });
    } else {
      await ctx.reply(error instanceof Error ? error.message : 'An unexpected error occurred.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'tasks_menu' }]
          ]
        }
      });
    }
  }
}

export async function handleTaskInput(ctx: BotContext) {
  if (!ctx.session.taskType) return;

  const taskType = ctx.session.taskType;
  const messageText = ctx.message?.text;
  if (!messageText) {
    await ctx.reply('Будь ласка, введіть коректне значення.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'create_task_menu' }]
        ]
      }
    });
    return;
  }

  if (taskType === 'invite' && ctx.session.reward === undefined) {
    const reward = parseInt(messageText, 10);
    if (isNaN(reward)) {
      await ctx.reply('Будь ласка, введіть коректну суму нагороди.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'create_task_menu' }]
          ]
        }
      });
      return;
    }
    ctx.session.reward = reward;
    await ctx.reply('Введіть кількість друзів, яке потрібно додати:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'create_task_menu' }]
        ]
      }
    });
    return;
  }

  if (taskType === 'invite' && ctx.session.reward !== undefined) {
    const requiredFriends = parseInt(messageText, 10);
    if (isNaN(requiredFriends)) {
      await ctx.reply('Будь ласка, введіть коректну кількість друзів.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'create_task_menu' }]
          ]
        }
      });
      return;
    }
    ctx.session.requiredFriends = requiredFriends;
    await createTask(ctx);
    return;
  }

  if (taskType === 'subscription') {
    if (!ctx.session.reward) {
      const reward = parseInt(messageText, 10);
      if (isNaN(reward)) {
        await ctx.reply('Будь ласка, введіть коректну суму нагороди.', {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Назад', callback_data: 'create_task_menu' }]
            ]
          }
        });
        return;
      }
      ctx.session.reward = reward;
      await ctx.reply('Введіть ID каналу:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'create_task_menu' }]
          ]
        }
      });
      return;
    }
    if (!ctx.session.chatId) {
      ctx.session.chatId = messageText;
      await ctx.reply('Введіть посилання на канал:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'create_task_menu' }]
          ]
        }
      });
      return;
    }
    if (!ctx.session.channelLink) {
      ctx.session.channelLink = messageText;
      await createTask(ctx);
      return;
    }
  }
}

async function createTask(ctx: BotContext) {
  const { taskType, reward, chatId, channelLink, requiredFriends } = ctx.session;
  try {
    const response = await axios.post(`${API_URL}/daily-tasks/create`, {
      type: taskType,
      coin: reward,
      chatId,
      channelLink,
      requiredFriends
    });
    if (response.data.success) {
      await ctx.reply('Завдання створено успішно.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад до меню завдань', callback_data: 'tasks_menu' }]
          ]
        }
      });
    } else {
      await ctx.reply(`Помилка при створенні завдання: ${response.data.error}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад до меню завдань', callback_data: 'tasks_menu' }]
          ]
        }
      });
    }
  } catch (error) {
    console.error(error);
    await ctx.reply('Помилка при створенні завдання.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад до меню завдань', callback_data: 'tasks_menu' }]
        ]
      }
    });
  }
  // Clear session data
  delete ctx.session.taskType;
  delete ctx.session.reward;
  delete ctx.session.chatId;
  delete ctx.session.channelLink;
  delete ctx.session.requiredFriends;
}

async function fetchTasks() {
  try {
    const response = await axios.get(`${API_URL}/daily-tasks/all`);
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw new Error('Помилка при отриманні даних задач.');
  }
} 