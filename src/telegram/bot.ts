import { Bot, session, Context } from 'grammy';
import { API_URL,SHOP_TYPES } from '../utils/constant';

import axios from 'axios';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined');
}

const bot = new Bot(token);

// Initialize session middleware
bot.use(session({ initial: () => ({}) }));

const adminIds = [667243325,734402848,6657451847,7418956723];

// Add admin check middleware
const adminCheck = async (ctx, next) => {
  if (!ctx.from || !adminIds.includes(Number(ctx.from.id))) {
    await ctx.reply('Вибачте, у вас немає доступу до цієї команди.');
    return;
  }
  await next();
};

// Базові команди
bot.command('start', async (ctx) => {
  await ctx.reply('Привет! Я бот для Whale.');
});

// Admin command
bot.command('admin', adminCheck, async (ctx) => {
  await ctx.reply('Вітаю, адміністраторе! Ви можете використовувати наступні команди:\n\n/help - Показати всі доступні команди', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Користувачі', callback_data: 'users' }],
        [{ text: 'Магазин', callback_data: 'shop' }],
        [{ text: 'Завдання', callback_data: 'tasks' }]
      ]
    }
  });
});

async function fetchUsers() {
  try {
    const response = await axios.get(`${API_URL}/user/all-users`);
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw new Error('Помилка при отриманні даних користувачів.');
  }
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

async function fetchItems() {
  try {
    const response = await axios.get(`${API_URL}/shop/items`);
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw new Error('Помилка при отриманні даних предметів.');
  }
}

// Handle button callbacks
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;
  switch (data) {
    case 'users':
      await ctx.reply(`Команди для роботи з користувачами:
/get_all_users - Отримати список всіх користувачів
/view_user <telegramId> - Переглянути інформацію про користувача
/update_user <telegramId> <parameter> <value> - Оновити параметр користувача (money, shield)
/update_item <telegramId> <itemId> <parameter> <value> - Оновити параметр предмета (name, type, level, shield, price)
/remove_item <telegramId> <itemId> - Видалити предмет з інвентаря
/equip_item <telegramId> <itemId> - Екіпірувати предмет
/unequip_item <telegramId> <itemId> - Зняти предмет
/upgrade_item <telegramId> <itemId> - Покращити предмет`);
      break;
    case 'tasks':
      await ctx.reply('Команди для роботи з завданнями:\n/get_all_tasks - Отримати список всіх задач\n/create_task - Команда для створення завдань');
      break;
    case 'create_task_subscription':
      // @ts-expect-error: suppress session property error
      ctx.session.taskType = 'subscription';
      await ctx.reply('Введіть нагороду для завдання:');
      break;
    case 'create_task_invite':
      // @ts-expect-error: suppress session property error
      ctx.session.taskType = 'invite';
      await ctx.reply('Введіть нагороду для завдання:');
      break;
    case 'shop':
      await ctx.reply('Команди для роботи з магазином:\n/get_shop_items - Отримати список всіх предметів магазину\n/create_shop_item - Створити новий предмет в магазині');
      break;
    case 'create_shop_item':
      // @ts-expect-error: suppress session property error
      ctx.session.creationStep = 'select_type';
      await ctx.reply('Виберіть тип предмета:', {
        reply_markup: {
          inline_keyboard: SHOP_TYPES.map(type => [{ text: type, callback_data: `type_${type}` }])
        }
      });
      break;
    default:
      await ctx.reply('Невідома команда.');
  }
});

// Command to view detailed user information
bot.command('view_user', adminCheck, async (ctx) => {
  if (!ctx.message) {
    await ctx.reply('Команда должна быть вызвана из текстового сообщения.');
    return;
  }
  const telegramId = ctx.message.text.split(' ')[1]; // Assuming the command is like /view_user <telegramId>
  if (!telegramId) {
    await ctx.reply('Будь ласка, вкажіть telegramId користувача.');
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
`);
  } catch (error) {
    console.error(error);
    await ctx.reply('Помилка при отриманні даних користувача.');
  }
});

// Command to update user parameters
bot.command('update_user', adminCheck, async (ctx) => {
  if (!ctx.message) {
    await ctx.reply('Команда должна быть вызвана из текстового сообщения.');
    return;
  }
  const args = ctx.message.text.split(' ');
  const telegramId = args[1]?.toString();
  const parameter = args[2]?.toString();
  const value = args[3] ? parseFloat(args[3].trim()) : undefined;

  if (!telegramId || !parameter || value === undefined) {
    await ctx.reply('Будь ласка, вкажіть telegramId, параметр та значення.\nПриклад: /update_user <telegramId> <parameter> <value>');
    return;
  }

  try {
    await axios.post(`${API_URL}/user/update-parameters`, {
      telegramId,
      [parameter]: value,
    });
    await ctx.reply(`Параметр ${parameter} користувача оновлено успішно.`);
  } catch (error) {
    console.error(error);
    await ctx.reply('Помилка при оновленні параметрів користувача.');
  }
});

// Command to update user shield
bot.command('update_user_shield', adminCheck, async (ctx) => {
  if (!ctx.message) {
    await ctx.reply('Команда должна быть вызвана из текстового сообщения.');
    return;
  }
  const args = ctx.message.text.split(' ');
  const telegramId = args[1]?.toString();
  const shield = args[2] ? parseFloat(args[2].toString()) : undefined;

  if (!telegramId) {
    await ctx.reply('Будь ласка, вкажіть telegramId.');
    return;
  }

  if (shield === undefined) {
    await ctx.reply('Будь ласка, вкажіть значення для оновлення (shield).');
    return;
  }

  try {
    await axios.post(`${API_URL}/user/update-parameters`, {
      telegramId,
      shield,
    });
    await ctx.reply('Значення щита користувача оновлено успішно.');
  } catch (error) {
    console.error(error);
    await ctx.reply('Помилка при оновленні значення щита користувача.');
  }
});

// Command to create a new task
bot.command('create_task', adminCheck, async (ctx) => {
  await ctx.reply('Виберіть тип завдання:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Підписка', callback_data: 'create_task_subscription' }],
        [{ text: 'Запрошення', callback_data: 'create_task_invite' }]
      ]
    }
  });
});

// Command to get help
bot.command('help', adminCheck, async (ctx) => {
  await ctx.reply(`Доступні команди:

Команди для користувачів:
/view_user <telegramId> - Переглянути інформацію про користувача
/get_all_users - Отримати список всіх користувачів
/update_user <telegramId> <parameter> <value> - Оновити параметр користувача (money, shield)
/update_item <telegramId> <itemId> <parameter> <value> - Оновити параметр предмета (name, type, level, shield, price)
/remove_item <telegramId> <itemId> - Видалити предмет з інвентаря
/equip_item <telegramId> <itemId> - Екіпірувати предмет
/unequip_item <telegramId> <itemId> - Зняти предмет
/upgrade_item <telegramId> <itemId> - Покращити предмет

Команди для завдань:
/get_all_tasks - Отримати список всіх задач
/create_task - Створити нове завдання

Команди для магазину:
/get_shop_items - Отримати список всіх предметів магазину
/create_shop_item - Створити новий предмет в магазині

Приклади використання:
/update_user 123456789 shield 100 - Встановити щит користувача
/update_item 123456789 1 shield 50 - Встановити щит предмета
/remove_item 123456789 1 - Видалити предмет з інвентаря`);
});

// Command to fetch all users
bot.command('get_all_users', adminCheck, async (ctx) => {
  try {
    const users = await fetchUsers();
    await ctx.reply('Список користувачів:');
    for (const user of users) {
      await ctx.reply(`ID: ${String(user.telegramId)}\nІм'я: ${String(user.displayName)}`);
    }
  } catch (error) {
    await ctx.reply(error instanceof Error ? error.message : 'An unexpected error occurred.');
  }
});

// Command to fetch all tasks
bot.command('get_all_tasks', adminCheck, async (ctx) => {
  try {
    const tasks = await fetchTasks();
    await ctx.reply('Список задач:');
    for (const task of tasks) {
      const date = new Date(String(task.createdAt));
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      const taskType = task.type === 'subscription' ? 'Підписка' : task.type === 'invite' ? 'Запрошення' : 'Невідомий тип';
      await ctx.reply(`\nID: ${String(task.id)}\nТип: ${taskType}\nНагорода: ${String(task.coin)}\nПосилання на канал: ${task.channelLink || 'Немає'}\nДата створення: ${formattedDate}`);
    }
  } catch (error) {
    await ctx.reply(error instanceof Error ? error.message : 'An unexpected error occurred.');
  }
});

// Command to fetch and display shop items
bot.command('get_shop_items', adminCheck, async (ctx) => {
  try {
    const items = await fetchItems();
    await ctx.reply('Список предметів магазину:');
    for (const item of items) {
      await ctx.reply(`ID: ${item.id}\nНазва: ${item.name}\nРівень: ${item.level}\nЩит: ${item.shield}\nТип: ${item.type}\nЦіна: ${item.price}`);
    }
  } catch (error) {
    await ctx.reply(error instanceof Error ? error.message : 'An unexpected error occurred.');
  }
});

bot.on('message', adminCheck, async (ctx) => {
  // @ts-expect-error: suppress session property error
  if (ctx.session.taskType) {
    // @ts-expect-error: suppress session property error
    const taskType = ctx.session.taskType;
    // @ts-expect-error: suppress session property error
    console.log('Current session:', ctx.session); // Log the current session state
    const messageText = ctx.message.text;
    if (!messageText) {
      await ctx.reply('Будь ласка, введіть коректне значення.');
      return;
    }
    // @ts-expect-error: suppress session property error
    if (taskType === 'invite' && ctx.session.reward === undefined) {
      const reward = parseInt(messageText, 10);
      if (isNaN(reward)) {
        await ctx.reply('Будь ласка, введіть коректну суму нагороди.');
        return;
      }
      // @ts-expect-error: suppress session property error
      ctx.session.reward = reward;
      console.log('Reward set:', reward); // Log the reward value
      await ctx.reply('Введіть кількість друзів, яке потрібно додати:');
      return;
    }
    // @ts-expect-error: suppress session property error
    if (taskType === 'invite' && ctx.session.reward !== undefined) {
      const requiredFriends = parseInt(messageText, 10);
      if (isNaN(requiredFriends)) {
        await ctx.reply('Будь ласка, введіть коректну кількість друзів.');
        return;
      }
      // @ts-expect-error: suppress session property error
      ctx.session.requiredFriends = requiredFriends;
      console.log('Required friends set:', requiredFriends); // Log the required friends value
      await createTask(ctx);
      return;
    }
    if (taskType === 'subscription') {
      // @ts-expect-error: suppress session property error
      if (!ctx.session.chatId) {
        // @ts-expect-error: suppress session property error
        ctx.session.chatId = messageText;
        await ctx.reply('Введіть посилання на канал:');
        return;
      }
      // @ts-expect-error: suppress session property error
      if (!ctx.session.channelLink) {
        // @ts-expect-error: suppress session property error
        ctx.session.channelLink = messageText;
        await createTask(ctx);
        return;
      }
      // @ts-expect-error: suppress session property error
      if (ctx.session.chatId && ctx.session.channelLink) {
        await createTask(ctx);
      }
    }
  // @ts-expect-error: suppress session property error
  } else if (ctx.session.reward && ctx.session.taskType === 'subscription') {
    // @ts-expect-error: suppress session property error
    if (ctx.session.chatId && ctx.session.channelLink) {
      await createTask(ctx);
    } else {
      await ctx.reply('Будь ласка, введіть коректний chatId та посилання на канал.');
      return;
    }
  // @ts-expect-error: suppress session property error
  } else if (ctx.session.reward && ctx.session.taskType === 'invite') {
    // @ts-expect-error: suppress session property error
    if (ctx.session.requiredFriends !== undefined) {
      await createTask(ctx);
    } else {
      await ctx.reply('Будь ласка, введіть коректну кількість друзів.');
      return;
    }
  }
});

async function createTask(ctx) {
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
      await ctx.reply('Завдання створено успішно.');
    } else {
      await ctx.reply(`Помилка при створенні завдання: ${response.data.error}`);
    }
  } catch (error) {
    console.error(error);
    await ctx.reply('Помилка при створенні завдання.');
  }
  // Clear session data
  delete ctx.session.taskType;
  delete ctx.session.reward;
  delete ctx.session.chatId;
  delete ctx.session.channelLink;
  delete ctx.session.requiredFriends;
}

bot.command('create_shop_item', adminCheck, async (ctx) => {
  // @ts-expect-error: suppress session property error
  ctx.session.creationStep = 'select_type';
  await ctx.reply('Виберіть тип предмета:', {
    reply_markup: {
      inline_keyboard: SHOP_TYPES.map(type => [{ text: type, callback_data: `type_${type}` }])
    }
  });
});

function isTextMessage(message: any): message is { text: string } {
  return message && typeof message.text === 'string';
}

// Handle item creation steps
bot.on('callback_query:data', adminCheck, async (ctx) => {
  const data = ctx.callbackQuery.data;
  // @ts-expect-error: suppress session property error
  if (ctx.session.creationStep === 'select_type' && data.startsWith('type_')) {
    // @ts-expect-error: suppress session property error
    ctx.session.itemType = data.replace('type_', '');
    // @ts-expect-error: suppress session property error
    ctx.session.creationStep = 'enter_name';
    await ctx.reply('Укажіть назву предмета:');
    return;
  }

  // @ts-expect-error: suppress session property error
  if (ctx.session.creationStep === 'enter_name' && isTextMessage(ctx.message)) {
    // @ts-expect-error: ctx.message is expected to have a text property
    ctx.session.itemName = ctx.message.text;
    // @ts-expect-error: suppress session property error
    ctx.session.creationStep = 'enter_shield';
    await ctx.reply('Укажіть кількість щита предмета:');
    return;
  }

  // @ts-expect-error: suppress session property error
  if (ctx.session.creationStep === 'enter_shield' && isTextMessage(ctx.message)) {
    // @ts-expect-error: ctx.message is expected to have a text property
    const shield = parseInt(ctx.message.text, 10);
    if (isNaN(shield)) {
      await ctx.reply('Будь ласка, введіть коректну кількість щита.');
      return;
    }
    // @ts-expect-error: suppress session property error
    ctx.session.itemShield = shield;
    // @ts-expect-error: suppress session property error
    ctx.session.creationStep = 'enter_level';
    await ctx.reply('Укажіть рівень предмета:');
    return;
  }

  // @ts-expect-error: suppress session property error
  if (ctx.session.creationStep === 'enter_level' && isTextMessage(ctx.message)) {
    // @ts-expect-error: ctx.message is expected to have a text property
    const level = parseInt(ctx.message.text, 10);
    if (isNaN(level)) {
      await ctx.reply('Будь ласка, введіть коректний рівень.');
      return;
    }
    // @ts-expect-error: suppress session property error
    ctx.session.itemLevel = level;
    // @ts-expect-error: suppress session property error
    ctx.session.creationStep = 'enter_price';
    await ctx.reply('Укажіть ціну предмета:');
    return;
  }

  // @ts-expect-error: suppress session property error
  if (ctx.session.creationStep === 'enter_price' && isTextMessage(ctx.message)) {
    // @ts-expect-error: ctx.message is expected to have a text property
    const price = parseInt(ctx.message.text, 10);
    if (isNaN(price)) {
      await ctx.reply('Будь ласка, введіть коректну ціну.');
      return;
    }
    // @ts-expect-error: suppress session property error
    ctx.session.itemPrice = price;

    // Create the item
    await createShopItem(ctx);
  }
});

async function createShopItem(ctx) {
  const { itemType, itemName, itemShield, itemLevel, itemPrice } = ctx.session;
  try {
    await axios.post(`${API_URL}/shop/items`, {
      type: itemType,
      name: itemName,
      shield: itemShield,
      level: itemLevel,
      price: itemPrice
    });
    await ctx.reply('Предмет успішно створено.');
  } catch (error) {
    console.error(error);
    await ctx.reply('Помилка при створенні предмета.');
  }
  // Clear session data
  delete ctx.session.creationStep;
  delete ctx.session.itemType;
  delete ctx.session.itemName;
  delete ctx.session.itemShield;
  delete ctx.session.itemLevel;
  delete ctx.session.itemPrice;
}

// Command to update item parameter
bot.command('update_item', adminCheck, async (ctx) => {
  if (!ctx.message) {
    await ctx.reply('Команда должна быть вызвана из текстового сообщения.');
    return;
  }
  const args = ctx.message.text.split(' ');
  const telegramId = args[1]?.toString();
  const itemId = args[2] ? parseInt(args[2]) : undefined;
  const parameter = args[3]?.toString();
  const value = args[4] ? parseFloat(args[4].trim()) : undefined;

  if (!telegramId || !itemId || !parameter || value === undefined) {
    await ctx.reply('Будь ласка, вкажіть telegramId, itemId, параметр та значення.\nПриклад: /update_item <telegramId> <itemId> <parameter> <value>');
    return;
  }

  try {
    await axios.post(`${API_URL}/user/items/${itemId}/update-parameter`, {
      telegramId,
      parameter,
      value,
    });
    await ctx.reply(`Параметр ${parameter} предмета оновлено успішно.`);
  } catch (error) {
    console.error(error);
    await ctx.reply('Помилка при оновленні параметрів предмета.');
  }
});

// Command to remove item
bot.command('remove_item', adminCheck, async (ctx) => {
  if (!ctx.message) {
    await ctx.reply('Команда должна быть вызвана из текстового сообщения.');
    return;
  }
  const args = ctx.message.text.split(' ');
  const telegramId = args[1]?.toString();
  const itemId = args[2] ? parseInt(args[2]) : undefined;

  if (!telegramId || !itemId) {
    await ctx.reply('Будь ласка, вкажіть telegramId та itemId.\nПриклад: /remove_item <telegramId> <itemId>');
    return;
  }

  try {
    await axios.post(`${API_URL}/user/items/${itemId}/remove`, {
      telegramId,
    });
    await ctx.reply('Предмет успішно видалено.');
  } catch (error) {
    console.error(error);
    await ctx.reply('Помилка при видаленні предмета.');
  }
});

// Запускаем бота
bot.start({
  onStart: (botInfo) => {
    console.log(`Bot started as @${botInfo.username}`);
  },
}).catch((err) => {
  console.error('Error starting bot:', err);
}); 