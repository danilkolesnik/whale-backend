import axios from 'axios';
import { BotContext } from '../../types';
import { API_URL, SHOP_TYPES } from '../../../utils/constant';

export async function handleRatingMenu(ctx: BotContext) {
  await ctx.editMessageText('Меню рейтингу:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🏅 Показати нагороди', callback_data: 'rating_view_rewards' }
        ],
        [
          { text: '✏️ Змінити нагороду', callback_data: 'rating_set_reward' }
        ],
        [
          { text: '🔙 Назад', callback_data: 'back_to_main' }
        ]
      ]
    }
  });
}

export async function handleViewRewards(ctx: BotContext) {
  try {
    const { data } = await axios.get(`${API_URL}/rating/rewards`);
    const lines = (data || [])
      .map((r: any) => `Место ${r.place}: ${r.reward}`)
      .join('\n');
    await ctx.editMessageText(lines || 'Нагороди не налаштовані', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'rating_menu' }]
        ]
      }
    });
  } catch (e) {
    await ctx.reply('Помилка під час отримання нагород');
  }
}

export async function handleSetRewardPrompt(ctx: BotContext) {
  const session: any = ctx.session;
  session.waitingForRewardPlace = true;
  session.rewardPlace = undefined;
  session.waitingForRewardAmount = false;
  await ctx.editMessageText('Введіть номер місця (1-10):', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔙 Назад', callback_data: 'rating_menu' }]
      ]
    }
  });
}

export async function handleRatingTextInput(ctx: BotContext) {
  const session: any = ctx.session;
  const text = ctx.message?.text?.trim() || '';

  if (session.waitingForRewardPlace) {
    const place = Number(text);
    if (!Number.isInteger(place) || place <= 0) {
      await ctx.reply('Некоректне місце. Введіть ціле число > 0');
      return;
    }
    session.rewardPlace = place;
    session.waitingForRewardPlace = false;
    session.waitingForRewardAmount = true;
    await ctx.reply('Введіть суму нагороди (число):');
    return;
  }

  if (session.waitingForRewardAmount) {
    const reward = Number(text);
    if (!Number.isFinite(reward) || reward < 0) {
      await ctx.reply('Некоректна сума. Введіть невід’ємне число');
      return;
    }
    try {
      await axios.put(`${API_URL}/rating/rewards`, {
        place: Number(session.rewardPlace),
        reward: Number(reward)
      }, { headers: { 'Content-Type': 'application/json' } });
      await ctx.reply(`Нагороду для місця ${session.rewardPlace} оновлено: ${reward}`);
    } catch (e) {
      await ctx.reply('Помилка під час збереження нагороди');
    } finally {
      session.waitingForRewardAmount = false;
      session.rewardPlace = undefined;
    }
    return;
  }
}


