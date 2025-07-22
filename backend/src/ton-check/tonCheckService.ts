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
            address: 'UQALYD4-Z2p9LBlp0FR0Y74cuplpfXEUj502Exf1P36fX8q7',
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
          const usdtAmount = tonAmount * tonPrice; 
          const user = await this.prisma.user.findUnique({
            where: { telegramId },
          });

          if (!user) {
            console.log('Skipping transaction: user not found');
            continue;
          }

          const balance = user.balance as { money: number; shield: number; tools: number; usdt: number };

          await this.prisma.user.update({
            where: { telegramId },
            data: {
              balance: {
                usdt: balance.usdt + Number(usdtAmount),
                money: balance.money,
                shield: balance.shield,
                tools: balance.tools,
              }
            }
          });

          await this.prisma.rechargeHistory.create({
            data: {
              userId: telegramId,
              valueCoin: Number(usdtAmount),
              amount: Number(usdtAmount),
              date: new Date().toISOString(),
            },
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