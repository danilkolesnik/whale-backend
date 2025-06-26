import { BotContext } from '../types';
import { API_URL } from '../../../utils/constant';
import axios from 'axios';


export async function handleUpgradeMenu(ctx: BotContext) {
  await ctx.editMessageText('⚙️ Налаштування прокачки:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📋 Переглянути налаштування', callback_data: 'view_upgrade_settings' }],
        [{ text: '➕ Створити налаштування', callback_data: 'create_upgrade_settings' }],
        [{ text: '✏️ Редагувати налаштування', callback_data: 'edit_upgrade_settings' }],
        [{ text: '🔄 Скидання послідовності', callback_data: 'reset_sequence_menu' }],
        [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
      ]
    }
  });
}

export async function handleViewUpgradeSettings(ctx: BotContext) {
  try {
    const response = await axios.get(`${API_URL}/user/upgrade-settings`);
    const settings = response.data;

    if (!settings || settings.length === 0) {
      await ctx.editMessageText('❌ Налаштування прокачки не знайдено.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'upgrade_menu' }]
          ]
        }
      });
      return;
    }

    let message = '📋 Поточні налаштування прокачки:\n\n';
    
    settings.forEach((setting: any) => {
      message += `🎯 Рівні: ${setting.levelRange}\n`;
      message += `🔧 Вартість: ${setting.toolsCost} інструментів\n`;
      message += `🎲 Шанс успіху: ${(setting.successRate * 100).toFixed(1)}%\n`;
      
      if (setting.useSequence) {
        message += `🔄 Використовує послідовність: ${setting.sequence.map((s: boolean) => s ? '✅' : '❌').join('')}\n`;
        message += `📍 Поточна позиція: ${setting.currentIndex}\n`;
      }
      
      message += '\n';
    });

    await ctx.editMessageText(message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'upgrade_menu' }]
        ]
      }
    });
  } catch (error) {
    await ctx.editMessageText('❌ Помилка отримання налаштувань', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'upgrade_menu' }]
        ]
      }
    });
  }
}

export async function handleCreateUpgradeSettings(ctx: BotContext) {
  ctx.session.upgradeAction = 'create';
  ctx.session.upgradeStep = 'levelRange';
  
  await ctx.editMessageText('Створення налаштувань прокачки\n\nВведіть діапазон рівнів (наприклад: 1-5):', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔙 Назад', callback_data: 'upgrade_menu' }]
      ]
    }
  });
}

export async function handleEditUpgradeSettings(ctx: BotContext) {
  try {
    const response = await axios.get(`${API_URL}/user/upgrade-settings`);
    const settings = response.data;

    if (!settings || settings.length === 0) {
      await ctx.editMessageText('❌ Налаштування для редагування не знайдено.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'upgrade_menu' }]
          ]
        }
      });
      return;
    }

    const keyboard = settings.map((setting: any) => [
      { text: `${setting.levelRange} (${setting.toolsCost} інстр., ${(setting.successRate * 100).toFixed(1)}%)`, callback_data: `edit_${setting.levelRange}` }
    ]);
    
    keyboard.push([{ text: '🔙 Назад', callback_data: 'upgrade_menu' }]);

    await ctx.editMessageText('Виберіть налаштування для редагування:', {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  } catch (error) {
    await ctx.editMessageText('❌ Помилка отримання налаштувань', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'upgrade_menu' }]
        ]
      }
    });
  }
}

export async function handleResetSequenceMenu(ctx: BotContext) {
  try {
    const response = await axios.get(`${API_URL}/user/upgrade-settings`);
    const settings = response.data.filter((s: any) => s.useSequence);

    if (!settings || settings.length === 0) {
      await ctx.editMessageText('❌ Налаштування з послідовностями не знайдено.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад', callback_data: 'upgrade_menu' }]
          ]
        }
      });
      return;
    }

    const keyboard = settings.map((setting: any) => [
      { text: `${setting.levelRange} (позиція: ${setting.currentIndex})`, callback_data: `reset_seq_${setting.levelRange}` }
    ]);
    
    keyboard.push([{ text: '🔙 Назад', callback_data: 'upgrade_menu' }]);

    await ctx.editMessageText('Виберіть послідовність для скидання:', {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  } catch (error) {
    await ctx.editMessageText('❌ Помилка отримання налаштувань', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'upgrade_menu' }]
        ]
      }
    });
  }
}

export async function handleUpgradeInput(ctx: BotContext) {
  const text = ctx.message?.text;
  if (!text) return;

  try {
    if (ctx.session.upgradeAction === 'create') {
      switch (ctx.session.upgradeStep) {
        case 'levelRange':
          ctx.session.upgradeData = { levelRange: text };
          ctx.session.upgradeStep = 'toolsCost';
          await ctx.reply('Введіть вартість в інструментах (наприклад: 3):');
          break;
          
        case 'toolsCost': {
          const toolsCost = parseInt(text);
          if (isNaN(toolsCost) || toolsCost < 1) {
            await ctx.reply('❌ Некоректна вартість. Введіть число більше 0:');
            return;
          }
          ctx.session.upgradeData!.toolsCost = toolsCost;
          ctx.session.upgradeStep = 'successRate';
          await ctx.reply('Введіть шанс успіху (0-100, наприклад: 80):');
          break;
        }
          
        case 'successRate': {
          const successRate = parseFloat(text);
          if (isNaN(successRate) || successRate < 0 || successRate > 100) {
            await ctx.reply('❌ Некоректний шанс. Введіть число від 0 до 100:');
            return;
          }
          ctx.session.upgradeData!.successRate = successRate / 100;
          ctx.session.upgradeData!.useSequence = false; // Всегда используем простой шанс
          await createUpgradeSettingsInDB(ctx);
          break;
        }
      }
    }
  } catch (error) {
    await ctx.reply('❌ Помилка обробки даних');
    ctx.session.upgradeAction = undefined;
    ctx.session.upgradeStep = undefined;
    ctx.session.upgradeData = undefined;
  }
}

async function createUpgradeSettingsInDB(ctx: BotContext) {
  try {
    const response = await axios.post(`${API_URL}/user/upgrade-settings`, ctx.session.upgradeData);
    
    await ctx.reply('✅ Налаштування прокачки створено успішно!', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 До меню прокачки', callback_data: 'upgrade_menu' }]
        ]
      }
    });
    
    // Clear session
    ctx.session.upgradeAction = undefined;
    ctx.session.upgradeStep = undefined;
    ctx.session.upgradeData = undefined;
  } catch (error) {
    await ctx.reply('❌ Помилка створення налаштувань');
  }
}

export async function handleResetSequence(ctx: BotContext, levelRange: string) {
  try {
    await axios.post(`${API_URL}/user/upgrade-settings/${levelRange}/reset-sequence`);
    
    await ctx.editMessageText(`✅ Послідовність для ${levelRange} скинуто успішно!`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'reset_sequence_menu' }]
        ]
      }
    });
  } catch (error) {
    await ctx.editMessageText('❌ Помилка скидання послідовності', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Назад', callback_data: 'reset_sequence_menu' }]
        ]
      }
    });
  }
} 