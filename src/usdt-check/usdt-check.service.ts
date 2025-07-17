//@ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsdtCheckService {
  constructor(private readonly prisma: PrismaService) {}

  private async findUser(telegramId: string) {
    return this.prisma.user.findUnique({
      where: { telegramId }
    });
  }

  async checkUsdtTransactions(telegramId: string, valueCoin: any, txid_in: any, test?: string) {
    try {
      console.log(telegramId, valueCoin,txid_in);

      const existingTransaction = await this.prisma.rechargeHistory.findUnique({
        where: { txidIn: txid_in }
      });

      if (existingTransaction) {
        return {
          message: 'Transaction already processed',
          userId: telegramId,
          valueCoin: valueCoin
        };
      }

      await this.prisma.rechargeHistory.create({
        data: {
          userId: telegramId,
          valueCoin: Number(valueCoin),
          amount: Number(valueCoin),
          txidIn: txid_in,
          date: new Date().toISOString(),
        },
      });

      const user = await this.findUser(telegramId);

      if (!user) {
        throw new Error('User not found');
      }

      const balance = user.balance as { money: number; shield: number; tools: number; usdt: number };
      
      await this.prisma.user.update({
        where: { telegramId },
        data: { 
          balance: { 
            money: balance.money,
            usdt: balance.usdt + Number(valueCoin),
            shield: balance.shield,
            tools: balance.tools,
        } },
      });


      return { 
        message: 'Balance updated successfully', 
        userId: telegramId, 
        valueCoin: valueCoin 
      };
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw new Error('Internal Server Error');
    }
  }
} 