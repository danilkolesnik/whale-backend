import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsdtCheckService {
  constructor(private readonly prisma: PrismaService) {}

  async checkUsdtTransactions(userId: string, valueCoin: any) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { telegramId: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const balance = typeof user.balance === 'string' ? JSON.parse(user.balance) : user.balance;
      await this.prisma.user.update({
        where: { telegramId: userId },
        data: { balance: { ...balance, 
          money: balance.money,
          usdt: balance.usdt + valueCoin,
          shield: balance.shield,
          tools: balance.tools,
        } },
      });

      await this.prisma.rechargeHistory.create({
        data: {
          userId: userId,
          valueCoin: valueCoin,
          amount: valueCoin * 100,
          date: new Date().toISOString(),
        },
      });

      return { 
        message: 'Balance updated successfully', 
        userId: userId, 
        valueCoin: valueCoin 
      };
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw new Error('Internal Server Error');
    }
  }
} 