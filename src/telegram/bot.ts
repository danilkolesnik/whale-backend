import { Bot } from 'grammy';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined');
}

const bot = new Bot(token);

// Базовые команды
bot.command('start', async (ctx) => {
  await ctx.reply('Привет! Я бот для Whale.');
});

// Запускаем бота
bot.start({
  onStart: (botInfo) => {
    console.log(`Bot started as @${botInfo.username}`);
  },
}).catch((err) => {
  console.error('Error starting bot:', err);
}); 