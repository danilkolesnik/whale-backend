import axios from 'axios';
import { API_URL } from '../../../utils/constant';
import { BotContext } from '../types';

export async function handleWhalesMenu(ctx: BotContext) {
  if (ctx.callbackQuery) {
    await ctx.editMessageText('Меню китів:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🐋 Переглянути всіх китів', callback_data: 'get_all_whales' }],
          [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
        ]
      }
    });
  } else {
    await ctx.reply('Меню китів:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🐋 Переглянути всіх китів', callback_data: 'get_all_whales' }],
          [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
        ]
      }
    });
  }
}

export async function handleGetAllWhales(ctx: BotContext) {
  try {
    const whales = await fetchWhales();
    
    if (whales.length === 0) {
      const message = '📊 Статистика китів:\n\n❌ Китів не знайдено.';
      
      if (ctx.callbackQuery) {
        await ctx.editMessageText(message, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Назад', callback_data: 'whales_menu' }]
            ]
          }
        });
      } else {
        await ctx.reply(message, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 Назад', callback_data: 'whales_menu' }]
            ]
          }
        });
      }
      return;
    }

    // Сортировка китов по total
    const sortedWhales = whales.sort((a, b) => a.total - b.total);
    
    let message = '🐋 Статистика всіх китів:\n\n';
    
    sortedWhales.forEach((whale, index) => {
      const percentComplete = whale.total > 0 
        ? ((whale.moneyTotal / whale.total) * 100).toFixed(2)
        : 0;
      
      message += `${index + 1}. Кит ID: ${whale.id.substring(0, 8)}...\n`;
      message += `   💰 Зібрано: ${whale.moneyTotal} / ${whale.total} (${percentComplete}%)\n`;
      message += `   👥 Учасників: ${whale.users.length}\n`;
      message += `   📅 Створено: ${new Date(whale.createdAt).toLocaleString('uk-UA')}\n\n`;
    });

    // Разбиваем сообщение на части, если оно слишком длинное
    const maxLength = 4096; // Telegram limit
    if (message.length > maxLength) {
      // Отправляем первую часть
      let currentMessage = '🐋 Статистика всіх китів:\n\n';
      let currentLength = currentMessage.length;
      
      for (const whale of sortedWhales) {
        const percentComplete = whale.total > 0 
          ? ((whale.moneyTotal / whale.total) * 100).toFixed(2)
          : 0;
        
        const whaleInfo = `${whale.id.substring(0, 8)}: ${whale.moneyTotal}/${whale.total} (${percentComplete}%), учасників: ${whale.users.length}\n`;
        
        if (currentLength + whaleInfo.length > maxLength - 200) {
          // Отправляем текущую часть и начинаем новую
          await ctx.editMessageText(currentMessage + '\n...', {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔙 Назад', callback_data: 'whales_menu' }]
              ]
            }
          });
          currentMessage = '🐋 (Продовження):\n\n';
          currentLength = currentMessage.length;
        }
        
        currentMessage += whaleInfo;
        currentLength += whaleInfo.length;
      }
      
      message = currentMessage;
    }

    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'whales_menu' }]
          ]
        }
      });
    } else {
      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'whales_menu' }]
          ]
        }
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    
    if (ctx.callbackQuery) {
      await ctx.editMessageText(`❌ Помилка: ${errorMessage}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'whales_menu' }]
          ]
        }
      });
    } else {
      await ctx.reply(`❌ Помилка: ${errorMessage}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'whales_menu' }]
          ]
        }
      });
    }
  }
}

async function fetchWhales() {
  try {
    const response = await axios.get(`${API_URL}/whales`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Помилка при отриманні даних китів.');
  }
}
