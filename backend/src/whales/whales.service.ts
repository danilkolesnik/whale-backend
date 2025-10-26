import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWhaleDto } from './dto/create-whale.dto';
import { ContributeToWhaleDto } from './dto/contribute-to-whale.dto';
import { Whale } from './interfaces/whale.interface';

@Injectable()
export class WhalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWhaleDto: CreateWhaleDto): Promise<Whale> {
    const whaleDb = await this.prisma.whale.create({
      data: {
        total: createWhaleDto.total,
        users: createWhaleDto.users,
        moneyTotal: createWhaleDto.moneyTotal,
      },
    });

    return {
      id: whaleDb.id,
      total: whaleDb.total,
      users: whaleDb.users as string[],
      moneyTotal: whaleDb.moneyTotal,
      createdAt: whaleDb.createdAt,
      updatedAt: whaleDb.updatedAt,
    };
  }

  async contributeToWhale(contributeDto: ContributeToWhaleDto): Promise<{ success: boolean; message: string; whale?: Whale; prize?: number; winner?: string }> {
    const { userId, whaleId, amount } = contributeDto;

    // Найти кита в БД
    const whaleDb = await this.prisma.whale.findUnique({
      where: { id: whaleId }
    });
    
    if (!whaleDb) {
      throw new NotFoundException('Whale not found');
    }

    const whale: Whale = {
      id: whaleDb.id,
      total: whaleDb.total,
      users: whaleDb.users as string[],
      moneyTotal: whaleDb.moneyTotal,
      createdAt: whaleDb.createdAt,
      updatedAt: whaleDb.updatedAt,
    };

    // Найти пользователя в базе данных
    const user = await this.prisma.user.findUnique({
      where: { telegramId: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const balance = user.balance as { money: number; shield: number; tools: number; usdt: number };

    // Проверить достаточность средств
    if (balance.money < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    // Обновить баланс пользователя
    await this.prisma.user.update({
      where: { telegramId: userId },
      data: {
        balance: {
          money: balance.money - amount,
          shield: balance.shield,
          tools: balance.tools,
          usdt: balance.usdt,
        },
      },
    });

    const updatedUsers = [...whale.users, userId];
    const updatedMoneyTotal = whale.moneyTotal + amount;
    
    const oldMoneyTotal = whale.moneyTotal;
    
    const result = await this.checkAndDistributePrize(
      whaleDb.id,
      whale.total,
      oldMoneyTotal,
      amount,
      updatedMoneyTotal,
      updatedUsers
    );

    // Обновить кита в БД
    await this.prisma.whale.update({
      where: { id: whaleId },
      data: {
        moneyTotal: result.moneyTotal ?? updatedMoneyTotal,
        users: result.users ?? updatedUsers,
      },
    });

    const updatedWhale = await this.prisma.whale.findUnique({
      where: { id: whaleId }
    });

    return {
      success: true,
      message: result.prizeWinner 
        ? `Successfully contributed ${amount} to whale ${whaleId}. Prize of ${result.prize} awarded to ${result.prizeWinner}!`
        : `Successfully contributed ${amount} to whale ${whaleId}`,
      whale: updatedWhale ? {
        id: updatedWhale.id,
        total: updatedWhale.total,
        users: updatedWhale.users as string[],
        moneyTotal: updatedWhale.moneyTotal,
        createdAt: updatedWhale.createdAt,
        updatedAt: updatedWhale.updatedAt,
      } : whale,
      prize: result.prize,
      winner: result.prizeWinner
    };
  }

  private async checkAndDistributePrize(
    whaleId: string,
    totalMilestone: number,
    oldMoneyTotal: number,
    contributionAmount: number,
    updatedMoneyTotal: number,
    updatedUsers: string[]
  ): Promise<{ prize?: number; prizeWinner?: string; moneyTotal?: number; users?: string[] }> {
    const prizeRange = { min: 1, max: 40 };
    const milestoneReached = oldMoneyTotal < totalMilestone && updatedMoneyTotal >= totalMilestone;

    if (milestoneReached) {
      const prizePercentage = Math.random() * (prizeRange.max - prizeRange.min) + prizeRange.min;
      const prize = Math.floor((totalMilestone * prizePercentage) / 100);

      if (updatedUsers.length > 0) {
        const recentContributors = [...new Set(updatedUsers)];
        const winner = recentContributors[Math.floor(Math.random() * recentContributors.length)];

        const winnerUser = await this.prisma.user.findUnique({
          where: { telegramId: winner }
        });

        if (winnerUser) {
          const winnerBalance = winnerUser.balance as { money: number; shield: number; tools: number; usdt: number };
          
          await this.prisma.user.update({
            where: { telegramId: winner },
            data: {
              balance: {
                money: winnerBalance.money + prize,
                shield: winnerBalance.shield,
                tools: winnerBalance.tools,
                usdt: winnerBalance.usdt,
              },
            },
          });

          return { 
            prize, 
            prizeWinner: winner,
            moneyTotal: 0,
            users: []
          };
        }
      }
    }

    return {
      moneyTotal: updatedMoneyTotal,
      users: updatedUsers
    };
  }

  async findAll(): Promise<Whale[]> {
    const whales = await this.prisma.whale.findMany({
      orderBy: { total: 'asc' }
    });

    return whales.map(whale => ({
      id: whale.id,
      total: whale.total,
      users: whale.users as string[],
      moneyTotal: whale.moneyTotal,
      createdAt: whale.createdAt,
      updatedAt: whale.updatedAt,
    }));
  }

  async findOne(id: string): Promise<Whale | null> {
    const whaleDb = await this.prisma.whale.findUnique({
      where: { id }
    });

    if (!whaleDb) {
      return null;
    }

    return {
      id: whaleDb.id,
      total: whaleDb.total,
      users: whaleDb.users as string[],
      moneyTotal: whaleDb.moneyTotal,
      createdAt: whaleDb.createdAt,
      updatedAt: whaleDb.updatedAt,
    };
  }
}
