import { Bot } from 'grammy';
import { InlineKeyboard } from 'grammy';
import axios from 'axios';
import { API_URL } from '../../utils/constant';

const token = process.env.TRANSACTION_BOT_TOKEN;
if (!token) {
  throw new Error('TRANSACTION_BOT_TOKEN is not defined');
}
const bot = new Bot(token);

export async function listenToRecentTransactions() {
  try {
    const response = await axios.get(`${API_URL}/transactions/recent`);
    const transactions = response.data;

    console.log('Transactions received:', transactions.length, 'documents');

    for (const transaction of transactions) {
      const telegramId = -4870740920;
      const transactionId = transaction.id;
      const displayName = transaction.displayName;
      const wallet = transaction.walletNumber;

      const keyboard = new InlineKeyboard()
        .text('Принять', `accept_${transactionId}`)
        .row()
        .text('Отказаться', `reject_${transactionId}`);

      const message = await bot.api
        .sendMessage(
          telegramId,
          `Транзакция
          \nID: ${transactionId}
          \nСтатус: Ожидание
          \nСумма: ${transaction.amount.toFixed(2)}$
          \nПользователь: ${displayName}
          \nКошелёк: ${wallet}`,
          { reply_markup: keyboard }
        )
        .catch((error) => {
          console.error(`Failed to send message to ${telegramId}:`, error);
        });

      if (message) {
        await axios.post(`${API_URL}/transactions/update`, {
          id: transactionId,
          messageId: message.message_id,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
  }
}


bot.on('callback_query:data', async (ctx) => {
  const [action, transactionId] = ctx.callbackQuery.data.split('_');

  console.log(transactionId);

  const transactionResponse = await axios.get(`${API_URL}/transactions/message/${transactionId}`);

  const transaction = transactionResponse.data;

  if (!transaction) {
    console.error(`Transaction ${transactionId} not found.`);
    return;
  }

  const messageId = transaction.messageId!;

  let statusText;
  if (action === 'accept') {
    await axios.post(`${API_URL}/transactions/update`, {
      id: transactionId,
      messageId: messageId,
      status: 'completed',
    });
    statusText = '✅ Принята';
  } else if (action === 'reject') {
    await axios.post(`${API_URL}/transactions/update`, {
      id: transactionId,
      messageId: messageId,
      status: 'failed',
    });
    statusText = '❌ Отклонена';
  }

  await bot.api
    .editMessageText(
      -4870740920,
      Number(messageId),
      `Транзакция обновлена
      \nID: ${transactionId}
      \nСтатус: ${statusText}
      \nСумма: ${transaction.amount.toFixed(2)}$
      \nПользователь: ${transaction.displayName}
      \nКошелёк: ${transaction.walletNumber}`
    )
    .catch((error) => {
      console.error(`Failed to edit message ${messageId}:`, error);
    });

  await ctx.answerCallbackQuery();
});

bot.command('start', async (ctx) => {
  await ctx.reply('Привет! Я бот для транзакций.');
});

bot.start({
  onStart: (botInfo) => {
    console.log(`Bot started as @${botInfo.username}`);
  },
}).catch((err) => {
  console.error('Error starting bot:', err);
}); 

export default bot; 