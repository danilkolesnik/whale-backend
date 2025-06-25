import { Bot, session } from 'grammy';
import { BotContext } from './handlers/types';
import { handleUsersMenu, handleViewUserMenu, handleUpdateUserMenu, handleGetAllUsers, handleUserInput } from './handlers/users/users.handler';
import { handleShopMenu, handleGetShopItems, handleCreateShopItem, handleShopItemInput } from './handlers/shop/shop.handler';
import { handleTasksMenu, handleCreateTaskMenu, handleCreateTaskSubscription, handleCreateTaskInvite, handleGetAllTasks, handleTaskInput } from './handlers/tasks/tasks.handler';
import { handleUpgradeMenu, handleViewUpgradeSettings, handleCreateUpgradeSettings, handleEditUpgradeSettings, handleResetSequenceMenu, handleUpgradeInput, handleResetSequence } from './handlers/upgrade/upgrade.handler';

const bot = new Bot<BotContext>(process.env.TELEGRAM_BOT_TOKEN || '');

// Initialize session middleware
bot.use(session({
  initial: () => ({})
}));

// Admin IDs for access control
const ADMIN_IDS = [667243325,7418956723,6657451847];

// Start command
bot.command('start', async (ctx) => {
  await ctx.reply('Вітаю! Я бот Whale!');
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
        [{ text: '📋 Завдання', callback_data: 'tasks_menu' }],
        [{ text: '⚙️ Налаштування прокачки', callback_data: 'upgrade_menu' }]
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
  } else if (callbackData.startsWith('type_')) {
    const itemType = callbackData.replace('type_', '');
    ctx.session.itemType = itemType;
    await ctx.editMessageText('Введіть назву предмета:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'shop_menu' }]
        ]
      }
    });
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

  // Upgrade menu
  else if (callbackData === 'upgrade_menu') {
    await handleUpgradeMenu(ctx);
  } else if (callbackData === 'view_upgrade_settings') {
    await handleViewUpgradeSettings(ctx);
  } else if (callbackData === 'create_upgrade_settings') {
    await handleCreateUpgradeSettings(ctx);
  } else if (callbackData === 'edit_upgrade_settings') {
    await handleEditUpgradeSettings(ctx);
  } else if (callbackData === 'reset_sequence_menu') {
    await handleResetSequenceMenu(ctx);
  } else if (callbackData.startsWith('reset_seq_')) {
    const levelRange = callbackData.replace('reset_seq_', '');
    await handleResetSequence(ctx, levelRange);
  }

  // Navigation
  else if (callbackData === 'back_to_main') {
    await ctx.editMessageText('Головне меню:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '👥 Користувачі', callback_data: 'users_menu' }],
          [{ text: '🛍️ Магазин', callback_data: 'shop_menu' }],
          [{ text: '📋 Завдання', callback_data: 'tasks_menu' }],
          [{ text: '⚙️ Налаштування прокачки', callback_data: 'upgrade_menu' }]
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
  } else if (ctx.session.upgradeAction) {
    await handleUpgradeInput(ctx);
  }
});

bot.start({
  onStart: (botInfo) => {
    console.log(`Bot started as @${botInfo.username}`);
  },
}).catch((err) => {
  console.error('Error starting bot:', err);
}); 

export default bot; 