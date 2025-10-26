import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWhaleDto } from './dto/create-whale.dto';
import { ContributeToWhaleDto } from './dto/contribute-to-whale.dto';
import { Whale } from './interfaces/whale.interface';

@Injectable()
export class WhalesService {
  private whales: Whale[] = [];

  constructor(private readonly prisma: PrismaService) {}

  create(createWhaleDto: CreateWhaleDto): Whale {
    const whale: Whale = {
      id: this.generateId(),
      ...createWhaleDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.whales.push(whale);
    return whale;
  }

  async contributeToWhale(contributeDto: ContributeToWhaleDto): Promise<{ success: boolean; message: string; whale?: Whale; prize?: number; winner?: string }> {
    const { userId, whaleId, amount } = contributeDto;

    // Найти кита
    const whale = this.whales.find(w => w.id === whaleId);
    if (!whale) {
      throw new NotFoundException('Whale not found');
    }

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

    // Обновить данные кита
    const whaleIndex = this.whales.findIndex(w => w.id === whaleId);
    if (whaleIndex !== -1) {
      const oldMoneyTotal = this.whales[whaleIndex].moneyTotal;
      this.whales[whaleIndex].moneyTotal += amount;
      this.whales[whaleIndex].users.push(userId);
      this.whales[whaleIndex].updatedAt = new Date();
      
      const result = await this.checkAndDistributePrize(whaleIndex, oldMoneyTotal, amount);

      return {
        success: true,
        message: result.prizeWinner 
          ? `Successfully contributed ${amount} to whale ${whaleId}. Prize of ${result.prize} awarded to ${result.prizeWinner}!`
          : `Successfully contributed ${amount} to whale ${whaleId}`,
        whale: this.whales[whaleIndex],
        prize: result.prize,
        winner: result.prizeWinner
      };
    }

    return {
      success: true,
      message: `Successfully contributed ${amount} to whale ${whaleId}`,
      whale: this.whales[whaleIndex]
    };
  }

  private async checkAndDistributePrize(whaleIndex: number, oldMoneyTotal: number, contributionAmount: number): Promise<{ prize?: number; prizeWinner?: string }> {
    const whale = this.whales[whaleIndex];
    const prizeRange = { min: 1, max: 40 }; // 1-40% приз
    
    // Проверяем, достигли ли мы кратного 100k или total
    const totalMilestone = whale.total;
    const contributionEnd = whale.moneyTotal;

    // Проверяем, пересекает ли внесение границу total (100% пулла)
    const milestoneReached = oldMoneyTotal < totalMilestone && contributionEnd >= totalMilestone;

    if (milestoneReached) {
      // Рассчитываем размер приза (1-40% от total)
      const prizePercentage = Math.random() * (prizeRange.max - prizeRange.min) + prizeRange.min;
      const prize = Math.floor((whale.total * prizePercentage) / 100);

      // Находим пользователей, которые внесли монеты после 60% пулла (последние 40%)
      const prizeStartRange = Math.floor(totalMilestone * 0.6);
      
      // Для упрощения берем последних пользователей (можно улучшить хранением истории)
      if (whale.users.length > 0) {
        // Берем последних пользователей как потенциальных кандидатов
        const recentContributors = [...new Set(whale.users)]; // уникальные пользователи
        const winner = recentContributors[Math.floor(Math.random() * recentContributors.length)];

        // Выдаем приз победителю
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

          // Обнуляем пулл для следующего цикла
          this.whales[whaleIndex].moneyTotal = 0;
          this.whales[whaleIndex].users = [];

          return { prize, prizeWinner: winner };
        }
      }
    }

    return {};
  }

  findAll(): Whale[] {
    return this.whales;
  }

  findOne(id: string): Whale | undefined {
    return this.whales.find(whale => whale.id === id);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
