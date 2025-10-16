import { Bot, session } from 'grammy';
import { BotContext } from './handlers/types';
import { handleUsersMenu, handleViewUserMenu, handleUpdateUserMenu, handleGetAllUsers, handleUserInput, handleUpdateUserMoney, handleUpdateUserShield, handleUpdateUserUsdt, handleUpdateUserTools, handleUpdateItemMenu, handleUpdateItemLevel, handleUpdateItemShield, handleUpdateItemsByTypeMenu, handleUpdateItemsArmor, handleUpdateItemsHelmet, handleUpdateItemsLeg, handleUpdateItemsByTypeLevel, handleUpdateItemsByTypeShield, handleUserTextInput } from './handlers/users/users.handler';
import { handleShopMenu, handleGetShopItems, handleCreateShopItem, handleShopItemInput } from './handlers/shop/shop.handler';
import { handleTasksMenu, handleCreateTaskMenu, handleCreateTaskSubscription, handleCreateTaskInvite, handleCreateTaskExternalSub, handleGetAllTasks, handleTaskInput } from './handlers/tasks/tasks.handler';
import { handleUpgradeMenu, handleViewUpgradeSettings, handleCreateUpgradeSettings, handleEditUpgradeSettings, handleResetSequenceMenu, handleUpgradeInput, handleResetSequence } from './handlers/upgrade/upgrade.handler';
import { handleRatingMenu, handleViewRewards, handleSetRewardPrompt, handleRatingTextInput } from './handlers/rating/rating.handler';

const bot = new Bot<BotContext>(process.env.TELEGRAM_BOT_TOKEN || '');

// Initialize session middleware
bot.use(session({
  initial: () => ({})
}));

// Admin IDs for access control
const ADMIN_IDS = [667243325,7418956723,6657451847,696937737];

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
        [{ text: '⚙️ Налаштування прокачки', callback_data: 'upgrade_menu' }],
        [{ text: '🏅 Рейтинг', callback_data: 'rating_menu' }]
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
  else if (callbackData === 'update_user_money') {
    await handleUpdateUserMoney(ctx);
  } else if (callbackData === 'update_user_shield') {
    await handleUpdateUserShield(ctx);
  } else if (callbackData === 'update_user_usdt') {
    await handleUpdateUserUsdt(ctx);
  } else if (callbackData === 'update_user_tools') {
    await handleUpdateUserTools(ctx);
  } else if (callbackData === 'update_item_menu') {
    await handleUpdateItemMenu(ctx);
  } else if (callbackData === 'update_item_level') {
    await handleUpdateItemLevel(ctx);
  } else if (callbackData === 'update_item_shield') {
    await handleUpdateItemShield(ctx);
  } else if (callbackData === 'update_items_by_type_menu') {
    await handleUpdateItemsByTypeMenu(ctx);
  } else if (callbackData === 'update_items_armor') {
    await handleUpdateItemsArmor(ctx);
  } else if (callbackData === 'update_items_helmet') {
    await handleUpdateItemsHelmet(ctx);
  } else if (callbackData === 'update_items_leg') {
    await handleUpdateItemsLeg(ctx);
  } else if (callbackData === 'update_items_by_type_level') {
    await handleUpdateItemsByTypeLevel(ctx);
  } else if (callbackData === 'update_items_by_type_shield') {
    await handleUpdateItemsByTypeShield(ctx);
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
  } else if (callbackData === 'create_task_external_sub') {
    await handleCreateTaskExternalSub(ctx);
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

  // Rating menu
  else if (callbackData === 'rating_menu') {
    await handleRatingMenu(ctx);
  } else if (callbackData === 'rating_view_rewards') {
    await handleViewRewards(ctx);
  } else if (callbackData === 'rating_set_reward') {
    await handleSetRewardPrompt(ctx);
  }

  // Navigation
  else if (callbackData === 'back_to_main') {
    await ctx.editMessageText('Головне меню:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '👥 Користувачі', callback_data: 'users_menu' }],
          [{ text: '🛍️ Магазин', callback_data: 'shop_menu' }],
          [{ text: '📋 Завдання', callback_data: 'tasks_menu' }],
          [{ text: '⚙️ Налаштування прокачки', callback_data: 'upgrade_menu' }],
          [{ text: '🏅 Рейтинг', callback_data: 'rating_menu' }]
        ]
      }
    });
  }
});

// Handle text messages
bot.on('message:text', async (ctx) => {
  const session: any = ctx.session;
  if (session.waitingForMoney || session.waitingForMoneyValue || 
      session.waitingForShield || session.waitingForShieldValue ||
      session.waitingForUsdt || session.waitingForUsdtValue ||
      session.waitingForTools || session.waitingForToolsValue ||
      session.waitingForItemTelegramId || session.waitingForItemId || session.waitingForItemValue ||
      session.waitingForItemsByTypeTelegramId || session.waitingForItemsByTypeParameter || session.waitingForItemsByTypeValue ||
      session.waitingForRewardPlace || session.waitingForRewardAmount) {
    if (session.waitingForRewardPlace || session.waitingForRewardAmount) {
      await handleRatingTextInput(ctx);
      return;
    }
    await handleUserTextInput(ctx);
    return;
  }
  if (session.waitingForTelegramId) {
    // Не вызывать handleUserInput, если сейчас обновляются параметры пользователя
    if (!(session.waitingForMoney || session.waitingForMoneyValue || 
          session.waitingForShield || session.waitingForShieldValue ||
          session.waitingForUsdt || session.waitingForUsdtValue ||
          session.waitingForTools || session.waitingForToolsValue ||
          session.waitingForItemTelegramId || session.waitingForItemId || session.waitingForItemValue ||
          session.waitingForItemsByTypeTelegramId || session.waitingForItemsByTypeParameter || session.waitingForItemsByTypeValue)) {
      await handleUserInput(ctx);
    }
  } else if (session.itemType) {
    await handleShopItemInput(ctx);
  } else if (session.taskType) {
    await handleTaskInput(ctx);
  } else if (session.upgradeAction) {
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