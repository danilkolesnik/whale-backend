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

  async checkUsdtTransactions(telegramId: string, valueCoin: any) {
    try {
      console.log(telegramId, valueCoin);
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
            usdt: balance.usdt + valueCoin,
            shield: balance.shield,
            tools: balance.tools,
        } },
      });

      await this.prisma.rechargeHistory.create({
        data: {
          userId: telegramId,
          valueCoin: valueCoin,
          amount: valueCoin,
          date: new Date().toISOString(),
        },
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