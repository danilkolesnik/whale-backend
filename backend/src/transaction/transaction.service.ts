import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async createTransaction(data: Prisma.TransactionCreateInput) {
    if (!data.user || !data.user.connect) {
      throw new Error('User relation is not properly defined.');
    }

    const user = await this.prisma.user.findUnique({
      where: { telegramId: data.user.connect.telegramId },
    });

    if (!user || !user.balance) {
      throw new Error('User or balance not found.');
    }

    const balance = user.balance as { money: number; shield: number; tools: number, usdt: number };

    if (typeof balance !== 'object' || balance === null || !('money' in balance)) {
      throw new Error('Invalid balance format');
    }

    const newBalance = balance.usdt - data.amount;

    await this.prisma.user.update({
      where: { telegramId: data.user.connect.telegramId },
      data: {
        balance: { 
          money: balance.money, 
          shield: balance.shield,
          tools: balance.tools,
          usdt: newBalance,
        },
      },
    });

    return this.prisma.transaction.create({
      data: {
        ...data,
        amount: data.amount,
      },
    });
  }

  // async getTransactions(userId: number) {
  //   return await this.prisma.transaction.findMany({
  //     where: { userId },
  //   });
  // }

  async getRecentTransactions() {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    return await this.prisma.transaction.findMany({
      where: {
        date: {
          gte: oneMinuteAgo,
        },
      },
    });
  }

  async updateTransactionMessage(id: number, messageId: number, status: string) {
    return await this.prisma.transaction.update({
      where: { id: Number(id) },
      data: { messageId, status },
    });
  }

  async getTransactionByMessageId(messageId: number) {
    return await this.prisma.transaction.findFirst({
      where: { id: messageId },
    });
  }
} 