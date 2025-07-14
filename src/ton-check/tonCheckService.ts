import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TonCheckService {
  constructor(private readonly prisma: PrismaService) {}

  async checkTonTransactions() {
    try {
      const ratesResponse = await axios.get("https://tonapi.io/v2/rates?tokens=ton&currencies=usd");
      const tonPrice = ratesResponse.data.rates.TON.prices.USD;

      const response = await axios.get(
        'https://toncenter.com/api/v2/getTransactions',
        {
          params: {
            address: 'UQCy8waDo2sgEz-pTLe5qFx_RB4KB8J57_FQnTYCnQlpHwrk',
            limit: 100,
            archival: true,
          },
        }
      );

      const txs = response.data.result;
      const currentTime = Math.floor(Date.now() / 1000);
      const oneMinuteAgo = currentTime - 60;

      for (const tx of txs) {
        try {
          const transactionTime = tx.utime;
          const telegramId = String(tx.in_msg.message || '').trim();
      
          if (transactionTime < oneMinuteAgo) {
            continue;
          }

          if (!telegramId) {
            console.log('Skipping transaction: no telegramId');
            continue;
          }

          const tonAmount = parseInt(tx.in_msg.value as string) / 1000000000;
          const usdtAmount = tonAmount * tonPrice / 100; 
          const user = await this.prisma.user.findUnique({
            where: { telegramId },
          });

          if (!user) {
            console.log('Skipping transaction: user not found');
            continue;
          }

          const balance = JSON.parse(user.balance as string) as { money: number; usdt: number; shield: number; tools: number };

          await this.prisma.user.update({
            where: { telegramId },
            data: {
              balance: {
                usdt: balance.usdt + usdtAmount,
                money: balance.money,
                shield: balance.shield,
                tools: balance.tools,
              }
            }
          });
      
          console.log({
            status: 1,
            tonAmount,
            usdtAmount,
            tonPrice,
            telegramId,
            transactionTime
          });
          
        } catch (error) {
          console.error('Error processing transaction:', error);
        }
      }

      return { status: 0 };
    } catch (error) {
      console.error('Error processing transactions:', error);
      return { error: 'Internal Server Error', status: 500 };
    }
  }
} 