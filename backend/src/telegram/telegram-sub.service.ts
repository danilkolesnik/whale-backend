import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TelegramSubService {
  private readonly botToken: string;

  constructor(private configService: ConfigService) {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  }

  async checkSubscription(chatId: number, userId: number): Promise<{
    success: boolean;
    error?: string;
    data?: {
      isSubscribed: boolean;
    };
  }> {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${this.botToken}/getChatMember`,
        {
          params: {
            chat_id: chatId,
            user_id: userId
          }
        }
      );

      const status = response.data.result.status;
      const isSubscribed = ['member', 'administrator', 'creator'].includes(status as string);

      return {
        success: true,
        data: {
          isSubscribed
        }
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error: 'Failed to check subscription'
      };
    }
  }
} 