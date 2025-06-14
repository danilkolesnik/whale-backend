import { Bot, session } from 'grammy';
import { BotContext } from './handlers/types';
import { handleUsersMenu, handleViewUserMenu, handleUpdateUserMenu, handleGetAllUsers, handleUserInput } from './handlers/users/users.handler';
import { handleShopMenu, handleGetShopItems, handleCreateShopItem, handleShopItemInput } from './handlers/shop/shop.handler';
import { handleTasksMenu, handleCreateTaskMenu, handleCreateTaskSubscription, handleCreateTaskInvite, handleGetAllTasks, handleTaskInput } from './handlers/tasks/tasks.handler';

const bot = new Bot<BotContext>(process.env.TELEGRAM_BOT_TOKEN || '');

// Initialize session middleware
bot.use(session({
  initial: () => ({})
}));

// Admin IDs for access control
const ADMIN_IDS = [667243325,7418956723,6657451847];

// Start command
bot.command('start', async (ctx) => {
  await ctx.reply('Вітаю! Я бот для управління системою.');
});

// Admin command
bot.command('admin', async (ctx) => {
  if (!ADMIN_IDS.includes(Number(ctx.from?.id))) {
    await ctx.reply('У вас немає доступу до адмін-панелі.');
    return;
  }

  await ctx.reply('Адмін-панель:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '👥 Користувачі', callback_data: 'users_menu' }],
        [{ text: '🛍️ Магазин', callback_data: 'shop_menu' }],
        [{ text: '📋 Завдання', callback_data: 'tasks_menu' }]
      ]
    }
  });
});

// Handle callback queries
bot.on('callback_query', async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  if (!callbackData) return;

  // Users menu
  if (callbackData === 'users_menu') {
    await handleUsersMenu(ctx);
  } else if (callbackData === 'view_user_menu') {
    await handleViewUserMenu(ctx);
  } else if (callbackData === 'update_user_menu') {
    await handleUpdateUserMenu(ctx);
  } else if (callbackData === 'get_all_users') {
    await handleGetAllUsers(ctx);
  }

  // Shop menu
  else if (callbackData === 'shop_menu') {
    await handleShopMenu(ctx);
  } else if (callbackData === 'get_shop_items') {
    await handleGetShopItems(ctx);
  } else if (callbackData === 'create_shop_item') {
    await handleCreateShopItem(ctx);
  }

  // Tasks menu
  else if (callbackData === 'tasks_menu') {
    await handleTasksMenu(ctx);
  } else if (callbackData === 'create_task_menu') {
    await handleCreateTaskMenu(ctx);
  } else if (callbackData === 'create_task_subscription') {
    await handleCreateTaskSubscription(ctx);
  } else if (callbackData === 'create_task_invite') {
    await handleCreateTaskInvite(ctx);
  } else if (callbackData === 'get_all_tasks') {
    await handleGetAllTasks(ctx);
  }

  // Navigation
  else if (callbackData === 'back_to_main') {
    await ctx.reply('Головне меню:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '👥 Користувачі', callback_data: 'users_menu' }],
          [{ text: '🛍️ Магазин', callback_data: 'shop_menu' }],
          [{ text: '📋 Завдання', callback_data: 'tasks_menu' }]
        ]
      }
    });
  }
});

// Handle text messages
bot.on('message:text', async (ctx) => {
  if (ctx.session.waitingForTelegramId) {
    await handleUserInput(ctx);
  } else if (ctx.session.itemType) {
    await handleShopItemInput(ctx);
  } else if (ctx.session.taskType) {
    await handleTaskInput(ctx);
  }
});

export default bot; 