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

    let updatedUsers: string[] = [];

    if(whale.users.includes(userId)){
      updatedUsers = [...whale.users];
    }else{
      updatedUsers = [...whale.users, userId];
    }
    
    const updatedMoneyTotal = whale.moneyTotal + amount;
    
    const oldMoneyTotal = whale.moneyTotal;
    
    const result = await this.checkAndDistributePrize(
      whale.total,
      oldMoneyTotal,
      updatedMoneyTotal,
      updatedUsers,
      userId
    );

    // Сначала обновляем кита в БД с новым moneyTotal (или 0, если был приз)
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

    const hasWon = result.prizeWinner === userId;

    return {
      success: hasWon,
      message: hasWon
        ? `Congratulations! You won the prize of ${result.prize}!`
        : `Your contribution of ${amount} was successful. The prize was awarded to another player.`,
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
    totalMilestone: number,
    oldMoneyTotal: number,
    updatedMoneyTotal: number,
    updatedUsers: string[],
    currentUserId: string
  ): Promise<{ prize?: number; prizeWinner?: string; moneyTotal?: number; users?: string[] }> {
    // Вычисляем сколько полных циклов прошло
    const oldCycles = Math.floor(oldMoneyTotal / totalMilestone);
    const newCycles = Math.floor(updatedMoneyTotal / totalMilestone);
    const cyclesPassed = newCycles - oldCycles;
    
    // Если прошли через новую границу цикла (или сразу превысили total)
    if (cyclesPassed > 0 && updatedUsers.length > 0) {
      // Приз = весь total от кита (например, если кит с total=100k, приз = 100k)
      const prize = totalMilestone;
      let lastWinner: string | undefined = undefined;

      const recentContributors = [...new Set(updatedUsers)];

      // Выдаем приз за каждый пройденный цикл
      for (let i = 0; i < cyclesPassed; i++) {
        const winner = recentContributors[Math.floor(Math.random() * recentContributors.length)];
        lastWinner = winner;

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
        }
      }

      // Вычисляем остаток
      const remainder = updatedMoneyTotal % totalMilestone;

      return { 
        prize, 
        prizeWinner: lastWinner,
        moneyTotal: remainder,
        users: remainder > 0 ? updatedUsers : []
      };
    }

    // Если не достигли максимума цикла, оставляем как есть
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
